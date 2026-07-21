import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import NineWicketWallet from "../models/NineWicketWallet.js";

const router = express.Router();

/* =========================================================
   API CONFIG
========================================================= */

const ORACLE_GAME_LAUNCH_URL =
  process.env.ORACLE_GAME_LAUNCH_URL ||
  "https://oraclegames.net/api/getgameurl";

const ORACLE_NINE_WICKET_URL =
  process.env.ORACLE_NINE_WICKET_URL ||
  "https://oraclegames.net/api/ninewicket";

const ORACLE_LAUNCH_KEY =
  process.env.ORACLE_LAUNCH_KEY || "29f68115e7ded8a4cb4e1a44a9d1890c";

const NINE_WICKET_GAME_UID =
  process.env.NINE_WICKET_GAME_UID || "48341a3bf62b6dd0814d7129e7e0834b";

/* =========================================================
   LAUNCH LOCK
========================================================= */

const launchLocks = new Map();

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

const requireAuth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";

    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId ||
      decoded?.user?._id ||
      decoded?.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = {
      id: userId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/* =========================================================
   MONEY HELPERS
========================================================= */

const toMoney = (value = 0) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return Math.trunc(amount * 100) / 100;
};

/* =========================================================
   USERNAME HELPERS
========================================================= */

const makeRandomUsername = (length) => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const randomBytes = crypto.randomBytes(length);

  let username = "";

  for (let index = 0; index < length; index += 1) {
    username += letters[randomBytes[index] % letters.length];
  }

  return username;
};

const normalizeUsername = (value = "") => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

/**
 * Other Oracle game username:
 * exactly 10 lowercase letters.
 */
const isValidOracleGameUsername = (value = "") => {
  return /^[a-z]{10}$/.test(normalizeUsername(value));
};

/**
 * NineWicket username:
 * exactly 6 lowercase letters.
 */
const isValidNineWicketUsername = (value = "") => {
  return /^[a-z]{6}$/.test(normalizeUsername(value));
};

const getOrCreateOracleGameUsername = async (user) => {
  const existingUsername = normalizeUsername(user.userGamePlayName);

  if (isValidOracleGameUsername(existingUsername)) {
    if (user.userGamePlayName !== existingUsername) {
      user.userGamePlayName = existingUsername;
      await user.save();
    }

    return existingUsername;
  }

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const generatedUsername = makeRandomUsername(10);

    if (!isValidOracleGameUsername(generatedUsername)) {
      continue;
    }

    const exists = await User.exists({
      userGamePlayName: generatedUsername,
    });

    if (exists) {
      continue;
    }

    try {
      user.userGamePlayName = generatedUsername;
      await user.save();

      return generatedUsername;
    } catch (error) {
      if (error?.code === 11000) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Failed to generate unique 10-letter Oracle game username");
};

const getOrCreateNineWicketUsername = async (user) => {
  const existingUsername = normalizeUsername(user.nineWicketUsername);

  if (isValidNineWicketUsername(existingUsername)) {
    if (user.nineWicketUsername !== existingUsername) {
      user.nineWicketUsername = existingUsername;
      await user.save();
    }

    return existingUsername;
  }

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const generatedUsername = makeRandomUsername(6);

    if (!isValidNineWicketUsername(generatedUsername)) {
      continue;
    }

    const exists = await User.exists({
      nineWicketUsername: generatedUsername,
    });

    if (exists) {
      continue;
    }

    try {
      user.nineWicketUsername = generatedUsername;
      await user.save();

      return generatedUsername;
    } catch (error) {
      if (error?.code === 11000) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Failed to generate unique 6-letter NineWicket username");
};

/* =========================================================
   RESPONSE HELPERS
========================================================= */

const extractLaunchUrl = (responseData) => {
  return (
    responseData?.launch_url ||
    responseData?.launchUrl ||
    responseData?.gameUrl ||
    responseData?.game_url ||
    responseData?.url ||
    responseData?.data?.launch_url ||
    responseData?.data?.launchUrl ||
    responseData?.data?.gameUrl ||
    responseData?.data?.game_url ||
    responseData?.data?.url ||
    ""
  );
};

/* =========================================================
   NINE WICKET WALLET
========================================================= */

const updateNineWicketWalletAfterTransfer = async ({
  userId,
  username,
  amount,
}) => {
  const safeAmount = toMoney(amount);

  const wallet = await NineWicketWallet.findOneAndUpdate(
    {
      user: userId,
    },
    {
      $set: {
        user: userId,
        username,
        lastTransferAmount: safeAmount,
        lastTransferAt: new Date(),
        lastSyncAt: new Date(),
        status: "playing",
      },

      $inc: {
        totalTransferred: safeAmount,
      },

      $setOnInsert: {
        totalReturned: 0,
        exposureBalance: 0,
        lastReturnedAmount: 0,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return wallet;
};

/* =========================================================
   BALANCE RESERVE / ROLLBACK HELPERS
========================================================= */

/**
 * NineWicket API call করার আগেই user-এর main balance reserve/deduct করবে।
 * এতে একই user একই balance দ্বিতীয়বার transfer করতে পারবে না।
 */
const reserveUserBalance = async ({ userId, amount }) => {
  const safeAmount = toMoney(amount);

  if (safeAmount <= 0) {
    return null;
  }

  return User.findOneAndUpdate(
    {
      _id: userId,
      isActive: true,
      balance: {
        $gte: safeAmount,
      },
    },
    {
      $inc: {
        balance: -safeAmount,
      },
    },
    {
      new: true,
    },
  ).select("balance currency");
};

/**
 * NineWicket API fail হলে reserved balance user-কে ফেরত দেবে।
 */
const rollbackUserBalance = async ({ userId, amount }) => {
  const safeAmount = toMoney(amount);

  if (safeAmount <= 0) {
    return;
  }

  await User.updateOne(
    {
      _id: userId,
    },
    {
      $inc: {
        balance: safeAmount,
      },
    },
  );
};

/* =========================================================
   PLAY GAME ROUTE
========================================================= */

router.post("/playgame", requireAuth, async (req, res) => {
  const requestedGameId = req.body?.game_uid || req.body?.gameID || "";

  const lockKey = `${req.user?.id}:${requestedGameId}`;

  let nineWicketBalanceReserved = false;
  let reservedNineWicketAmount = 0;
  let reservedNineWicketUserId = null;

  try {
    /* -----------------------------------------------------
       PREVENT DUPLICATE LAUNCH
    ----------------------------------------------------- */

    if (launchLocks.has(lockKey)) {
      return res.status(429).json({
        success: false,
        message: "Game launch already processing. Please wait.",
      });
    }

    launchLocks.set(lockKey, true);

    /* -----------------------------------------------------
       VALIDATE GAME UID
    ----------------------------------------------------- */

    const { gameID, game_uid } = req.body || {};

    const gameUId = String(game_uid || gameID || "").trim();

    if (!gameUId) {
      return res.status(400).json({
        success: false,
        message: "game_uid is required",
      });
    }

    if (!ORACLE_LAUNCH_KEY) {
      return res.status(500).json({
        success: false,
        message: "ORACLE_LAUNCH_KEY missing",
      });
    }

    /* -----------------------------------------------------
       FIND USER
    ----------------------------------------------------- */

    const user = await User.findById(req.user?.id).select(
      [
        "username",
        "userId",
        "phone",
        "balance",
        "isActive",
        "currency",
        "userGamePlayName",
        "nineWicketUsername",
      ].join(" "),
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    /* -----------------------------------------------------
       VALIDATE BALANCE
    ----------------------------------------------------- */

    const currentBalance = toMoney(user.balance);

    if (currentBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: "No balance, please deposit",
      });
    }

    /**
     * আগের মতো integer amount transfer।
     * Decimal balance থাকলে দরকার অনুযায়ী toMoney(currentBalance)
     * ব্যবহার করতে পারো।
     */
    const amount = Math.floor(currentBalance);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid transferable balance",
      });
    }

    /* =====================================================
       NINE WICKET GAME
    ===================================================== */

    if (gameUId === NINE_WICKET_GAME_UID) {
      const generatedUsername = await getOrCreateNineWicketUsername(user);

      const nineWicketUsername = normalizeUsername(generatedUsername);

      if (!isValidNineWicketUsername(nineWicketUsername)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid NineWicket username. Username must be exactly 6 lowercase letters.",
          debug: {
            username: nineWicketUsername,
            usernameLength: nineWicketUsername.length,
            usernameValid: false,
          },
        });
      }

      /* ---------------------------------------------------
         STEP 1: RESERVE LOCAL BALANCE FIRST
      --------------------------------------------------- */

      const reservedUser = await reserveUserBalance({
        userId: user._id,
        amount,
      });

      if (!reservedUser) {
        return res.status(409).json({
          success: false,
          message:
            "Balance changed while launching NineWicket. Please refresh and try again.",
        });
      }

      nineWicketBalanceReserved = true;
      reservedNineWicketAmount = amount;
      reservedNineWicketUserId = user._id;

      const remainingBalance = toMoney(reservedUser.balance);

      const nineWicketPayload = {
        username: nineWicketUsername,
        amount,
      };

      console.log("========== NINE WICKET TRANSFER START ==========");

      console.log("User ID:", String(user._id));

      console.log("NineWicket Username:", JSON.stringify(nineWicketUsername));

      console.log("NineWicket Username Length:", nineWicketUsername.length);

      console.log(
        "NineWicket Username Valid:",
        /^[a-z]{6}$/.test(nineWicketUsername),
      );

      console.log("DB Balance Before Reserve:", currentBalance);

      console.log("DB Balance After Reserve:", remainingBalance);

      console.log("Amount Sending:", amount);

      console.log("NineWicket Payload:", nineWicketPayload);

      /* ---------------------------------------------------
         STEP 2: TRANSFER TO NINE WICKET
      --------------------------------------------------- */

      const nineWicketResponse = await axios.post(
        ORACLE_NINE_WICKET_URL,
        nineWicketPayload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-oracle-key": ORACLE_LAUNCH_KEY,
          },
          timeout: 30000,
        },
      );

      console.log("NineWicket Response:", nineWicketResponse.data);

      const transferStatus = Number(nineWicketResponse.data?.transfer_status);

      const gameUrl = extractLaunchUrl(nineWicketResponse.data);

      if (transferStatus !== 1 || !gameUrl) {
        /**
         * Provider transfer fail করলে local balance ফেরত।
         */
        await rollbackUserBalance({
          userId: user._id,
          amount,
        });

        nineWicketBalanceReserved = false;

        console.error(
          "❌ NineWicket transfer failed. Local balance rolled back.",
        );

        return res.status(502).json({
          success: false,

          message:
            nineWicketResponse.data?.message || "NineWicket transfer failed",

          error: nineWicketResponse.data,
        });
      }

      /* ---------------------------------------------------
         STEP 3: UPDATE LOCAL WALLET TRACKING
      --------------------------------------------------- */

      let wallet;

      try {
        wallet = await updateNineWicketWalletAfterTransfer({
          userId: user._id,
          username: nineWicketUsername,
          amount,
        });
      } catch (walletError) {
        /**
         * Provider transfer ইতোমধ্যে success।
         * তাই এখানে local balance rollback করা যাবে না।
         * নাহলে provider এবং site দুই জায়গাতেই টাকা থাকবে।
         */
        console.error(
          "NineWicket wallet tracking update failed:",
          walletError.message,
        );

        wallet = await NineWicketWallet.findOne({
          user: user._id,
        });
      }

      /**
       * Provider transfer success।
       * এখন catch block যেন local balance rollback না করে।
       */
      nineWicketBalanceReserved = false;

      console.log("✅ NineWicket transfer success.");

      console.log("✅ User local balance:", remainingBalance);

      console.log("✅ Game URL will be returned only after transfer success.");

      console.log("NineWicket Wallet:", {
        totalTransferred: Number(wallet?.totalTransferred || 0),

        totalReturned: Number(wallet?.totalReturned || 0),

        exposureBalance: Number(wallet?.exposureBalance || 0),

        status: wallet?.status || "playing",
      });

      console.log("========== NINE WICKET TRANSFER END ==========");

      /* ---------------------------------------------------
         STEP 4: RETURN GAME URL AFTER TRANSFER
      --------------------------------------------------- */

      return res.status(200).json({
        success: true,

        gameUrl,
        launch_url: gameUrl,
        game_url: gameUrl,

        provider: "ninewicket",

        /**
         * Client current tab-এ direct open করবে।
         */
        openType: "same_tab",
        iframeFallback: false,
        directOpenUrl: gameUrl,

        used: {
          game_uid: gameUId,

          username: nineWicketUsername,

          usernameLength: nineWicketUsername.length,

          amount,

          balanceTransferred: true,

          oldBalance: currentBalance,

          newBalance: remainingBalance,
        },

        nineWicketWallet: {
          totalTransferred: Number(wallet?.totalTransferred || 0),

          totalReturned: Number(wallet?.totalReturned || 0),

          exposureBalance: Number(wallet?.exposureBalance || 0),

          status: wallet?.status || "playing",
        },
      });
    }

    /* =====================================================
       OTHER ORACLE GAMES
       EXISTING FUNCTIONALITY SAME
    ===================================================== */

    const oracleGameUsername = await getOrCreateOracleGameUsername(user);

    if (!isValidOracleGameUsername(oracleGameUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Oracle game username. Username must be exactly 10 lowercase letters.",
      });
    }

    const oraclePayload = {
      amount: String(amount),
      username: oracleGameUsername,
      game_uid: gameUId,
    };

    const oracleResponse = await axios.post(
      ORACLE_GAME_LAUNCH_URL,
      oraclePayload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-oracle-key": ORACLE_LAUNCH_KEY,
        },
        timeout: 30000,
      },
    );

    const gameUrl = extractLaunchUrl(oracleResponse.data);

    if (!gameUrl) {
      return res.status(502).json({
        success: false,
        message: "No launch_url received from Oracle API",
        error: oracleResponse.data,
      });
    }

    return res.status(200).json({
      success: true,

      gameUrl,
      launch_url: gameUrl,
      game_url: gameUrl,

      provider: "oracle",

      used: {
        game_uid: gameUId,

        username: oracleGameUsername,

        usernameLength: oracleGameUsername.length,

        amount: oraclePayload.amount,
      },
    });
  } catch (error) {
    /**
     * NineWicket API request throw করলে এবং balance reserve হয়ে থাকলে
     * main balance rollback হবে।
     */
    if (
      nineWicketBalanceReserved &&
      reservedNineWicketUserId &&
      reservedNineWicketAmount > 0
    ) {
      try {
        await rollbackUserBalance({
          userId: reservedNineWicketUserId,

          amount: reservedNineWicketAmount,
        });

        console.log("✅ NineWicket error: reserved local balance rolled back.");
      } catch (rollbackError) {
        console.error(
          "❌ NineWicket balance rollback failed:",
          rollbackError.message,
        );
      }
    }

    const providerError =
      error?.response?.data || error?.message || "Unknown game launch error";

    console.error("PlayGame API Error:", providerError);

    return res.status(error?.response?.status || 500).json({
      success: false,

      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to launch game",

      error: providerError,
    });
  } finally {
    setTimeout(() => {
      launchLocks.delete(lockKey);
    }, 8000);
  }
});

export default router;
