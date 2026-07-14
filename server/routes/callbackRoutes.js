import express from "express";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import GameHistory from "../models/GameHistory.js";
import NineWicketWallet from "../models/NineWicketWallet.js";

const router = express.Router();

const NINE_WICKET_GAME_UID =
  process.env.NINE_WICKET_GAME_UID || "48341a3bf62b6dd0814d7129e7e0834b";

/* =========================================================
   HELPERS
========================================================= */

const toNum = (value = 0) => {
  const number = Number.parseFloat(value);

  return Number.isFinite(number) ? number : 0;
};

const money = (value = 0) => {
  const number = toNum(value);

  return Math.trunc(number * 100) / 100;
};

const clean = (value = "") => {
  return String(value || "").trim();
};

const cleanMemberAccount = (value = "") => {
  let username = clean(value).toLowerCase();

  if (username.endsWith("orclegames")) {
    username = username.slice(0, -"orclegames".length);
  }

  return username;
};

const isNineWicketGame = (gameUId = "") => {
  return clean(gameUId) === NINE_WICKET_GAME_UID;
};

/* =========================================================
   TURNOVER
========================================================= */

const applyTurnoverProgress = async ({ userId, wagerAmount }) => {
  const amount = money(wagerAmount);

  if (amount <= 0) return;

  const runningTurnovers = await TurnOver.find({
    user: userId,
    status: "running",
  }).sort({
    createdAt: 1,
  });

  let remaining = amount;

  for (const turnover of runningTurnovers) {
    if (remaining <= 0) break;

    const required = money(turnover.required);
    const progress = money(turnover.progress);

    const left = Math.max(0, money(required - progress));

    if (left <= 0) {
      await TurnOver.updateOne(
        {
          _id: turnover._id,
        },
        {
          $set: {
            status: "completed",
            completedAt: new Date(),
          },
        },
      );

      continue;
    }

    const add = money(Math.min(left, remaining));

    const newProgress = money(progress + add);

    const completed = newProgress >= required;

    await TurnOver.updateOne(
      {
        _id: turnover._id,
      },
      {
        $inc: {
          progress: add,
        },

        ...(completed
          ? {
              $set: {
                status: "completed",
                completedAt: new Date(),
              },
            }
          : {}),
      },
    );

    remaining = money(remaining - add);
  }
};

/* =========================================================
   NINE WICKET EXPOSURE
========================================================= */

/**
 * NineWicket exposure rules:
 *
 * Rule 1 — Bet callback:
 *
 * betAmount > 0 && winAmount === 0
 *
 * একই game_round-এর আগের bet callback থাকলে:
 *
 * exposure =
 *   currentExposure
 *   - previousSameRoundStake
 *   + currentStake
 *
 * আগের callback না থাকলে:
 *
 * exposure =
 *   currentExposure + currentStake
 *
 *
 * Rule 2 — Return / settlement / close callback:
 *
 * betAmount === 0
 *
 * winAmount 0 অথবা 0-এর বেশি—দুই ক্ষেত্রেই:
 *
 * exposure =
 *   currentExposure - currentStake
 *
 *
 * betStatus কোনো হিসাবেই ব্যবহার হবে না।
 * Exposure কখনো 0-এর নিচে যাবে না।
 */
const updateNineWicketExposure = async ({
  player,
  nineWicketUsername,
  gameRound,
  betAmount,
  winAmount,
  matchStake,
}) => {
  const safeMatchStake = Math.max(0, money(matchStake));

  let wallet = await NineWicketWallet.findOne({
    user: player._id,
  });

  if (!wallet) {
    wallet = await NineWicketWallet.create({
      user: player._id,
      username: nineWicketUsername,

      totalTransferred: 0,
      totalReturned: 0,

      exposureBalance: 0,

      lastTransferAmount: 0,
      lastReturnedAmount: 0,

      lastSyncAt: new Date(),

      status: "idle",
    });
  }

  const currentExposure = Math.max(0, money(wallet.exposureBalance || 0));

  let previousRoundMatchStake = 0;
  let exposureChange = 0;
  let exposureAfter = currentExposure;
  let exposureAction = "none";

  /* -------------------------------------------------------
     BET CALLBACK
  ------------------------------------------------------- */

  if (betAmount > 0 && winAmount === 0 && safeMatchStake > 0) {
    const previousRoundBet = await GameHistory.findOne({
      user: player._id,
      provider: "ninewicket",
      game_round: gameRound,

      bet_amount: {
        $gt: 0,
      },

      win_amount: 0,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (previousRoundBet) {
      previousRoundMatchStake = Math.max(
        0,
        money(previousRoundBet.matchStake || 0),
      );
    }

    exposureChange = money(safeMatchStake - previousRoundMatchStake);

    exposureAfter = Math.max(
      0,
      money(currentExposure - previousRoundMatchStake + safeMatchStake),
    );

    exposureAction =
      previousRoundMatchStake > 0 ? "replace_same_round" : "add_new_round";
  } else if (betAmount === 0 && safeMatchStake > 0) {

  /* -------------------------------------------------------
     SETTLEMENT / CLOSE CALLBACK
  ------------------------------------------------------- */
    exposureChange = -safeMatchStake;

    exposureAfter = Math.max(0, money(currentExposure - safeMatchStake));

    exposureAction =
      winAmount > 0 ? "subtract_settlement" : "subtract_zero_win";
  }

  /* -------------------------------------------------------
     WALLET STATUS
  ------------------------------------------------------- */

  let walletStatus = wallet.status || "idle";

  if (exposureAfter > 0) {
    walletStatus = "exposure";
  } else if (exposureAction !== "none") {
    walletStatus = "settled";
  }

  wallet.username = nineWicketUsername;

  wallet.exposureBalance = exposureAfter;

  wallet.lastSyncAt = new Date();

  wallet.status = walletStatus;

  await wallet.save();

  return {
    wallet,
    previousRoundMatchStake,
    exposureAction,
    exposureChange,
    exposureAfter,
  };
};

/* =========================================================
   CALLBACK ROUTE
========================================================= */

router.post("/", async (req, res) => {
  try {
    const {
      game_uid,
      game_round,
      bet_amount,
      serial_number,
      win_amount,
      member_account,
      currency_code,
      timestamp,
      nine_wicket,
    } = req.body || {};

    /* -----------------------------------------------------
       REQUIRED FIELD VALIDATION
    ----------------------------------------------------- */

    if (
      !game_uid ||
      !game_round ||
      !serial_number ||
      bet_amount === undefined ||
      win_amount === undefined ||
      !member_account
    ) {
      return res.status(200).json({
        success: false,
        balance: 0,
        message: "Missing required fields",
      });
    }

    const gameUId = clean(game_uid);

    const gameRound = clean(game_round);

    const serialNumber = clean(serial_number);

    const rawMemberAccount = clean(member_account);

    const cleanedMemberAccount = cleanMemberAccount(member_account);

    const betAmount = money(bet_amount);

    const winAmount = money(win_amount);

    const nineWicketCallback = isNineWicketGame(gameUId);

    if (betAmount < 0 || winAmount < 0) {
      return res.status(200).json({
        success: false,
        balance: 0,
        message: "Invalid amount",
      });
    }

    /* -----------------------------------------------------
       DUPLICATE CHECK

       শুধু serial_number unique।
       একই game_round একাধিক callback-এ আসতে পারবে।
    ----------------------------------------------------- */

    const duplicate = await GameHistory.findOne({
      serial_number: serialNumber,
    }).lean();

    if (duplicate) {
      return res.status(200).json({
        success: false,

        balance: duplicate.balance_after || 0,

        message: "DUPLICATE",

        data: {
          status: "DUPLICATE",

          balance: duplicate.balance_after || 0,

          game_round: gameRound,

          serial_number: serialNumber,
        },
      });
    }

    /* =====================================================
       NINE WICKET CALLBACK
    ===================================================== */

    if (nineWicketCallback) {
      const nineWicketUsername = cleanedMemberAccount;

      if (!/^[a-z]{6}$/.test(nineWicketUsername)) {
        return res.status(200).json({
          success: false,
          balance: 0,

          message: "INVALID_NINE_WICKET_USERNAME",

          data: {
            member_account: rawMemberAccount,

            nineWicketUsername,
          },
        });
      }

      const player = await User.findOne({
        nineWicketUsername,
        isActive: true,
      });

      if (!player) {
        return res.status(200).json({
          success: false,
          balance: 0,

          message: "USER_NOT_FOUND",

          data: {
            member_account: rawMemberAccount,

            nineWicketUsername,
          },
        });
      }

      /* ---------------------------------------------------
         NINE WICKET DATA
      --------------------------------------------------- */

      const matchStake = Math.max(
        0,
        money(nine_wicket?.matchStake ?? nine_wicket?.matchAmount ?? 0),
      );

      const profitLoss = money(nine_wicket?.profitLoss || 0);

      const nineWicketBetId = clean(nine_wicket?.betId);

      const nineWicketBetStatus = clean(nine_wicket?.betStatus);

      /**
       * নতুন ৪টি NineWicket history field।
       */
      const eventTypeName = clean(nine_wicket?.eventTypeName);

      const eventName = clean(nine_wicket?.eventName);

      const marketName = clean(nine_wicket?.marketName);

      const competitionName = clean(nine_wicket?.competitionName);

      /* ---------------------------------------------------
         MAIN BALANCE UNCHANGED
      --------------------------------------------------- */

      const currentBalance = money(player.balance || 0);

      const finalBalance = currentBalance;

      const netAmount = money(winAmount - betAmount);

      let resultType = "push";

      if (netAmount > 0) {
        resultType = "win";
      }

      if (netAmount < 0) {
        resultType = "loss";
      }

      /* ---------------------------------------------------
         EXPOSURE UPDATE
      --------------------------------------------------- */

      const {
        wallet,
        previousRoundMatchStake,
        exposureAction,
        exposureChange,
        exposureAfter,
      } = await updateNineWicketExposure({
        player,
        nineWicketUsername,
        gameRound,
        betAmount,
        winAmount,
        matchStake,
      });

      /* ---------------------------------------------------
         GAME HISTORY
      --------------------------------------------------- */

      const history = await GameHistory.create({
        user: player._id,

        username: player.username || nineWicketUsername,

        userGamePlayName: player.userGamePlayName || "",

        nineWicketUsername,

        provider: "ninewicket",

        member_account: rawMemberAccount,

        phone: player.phone || "",

        currency: currency_code || player.currency || "BDT",

        userRole: player.role || "user",

        game_uid: gameUId,

        game_round: gameRound,

        serial_number: serialNumber,

        bet_amount: betAmount,

        win_amount: winAmount,

        net_amount: netAmount,

        resultType,

        balance_before: currentBalance,

        balance_after: finalBalance,

        nineWicketBetId,

        nineWicketBetStatus,

        matchStake,

        profitLoss,

        /**
         * NineWicket event information।
         */
        eventTypeName,
        eventName,
        marketName,
        competitionName,

        exposureChange,

        exposureAfter,

        oracleTimestamp: clean(timestamp),

        rawPayload: req.body || {},
      });

      /* ---------------------------------------------------
         TURNOVER
      --------------------------------------------------- */

      if (betAmount > 0) {
        await applyTurnoverProgress({
          userId: player._id,

          wagerAmount: betAmount,
        });
      }

      /* ---------------------------------------------------
         LOG
      --------------------------------------------------- */

      console.log("========== NINE WICKET CALLBACK SUCCESS ==========");

      console.log("User:", nineWicketUsername);

      console.log("Game Round:", gameRound);

      console.log("Bet Amount:", betAmount);

      console.log("Win Amount:", winAmount);

      console.log("Match Stake:", matchStake);

      console.log("Event Type Name:", eventTypeName);

      console.log("Event Name:", eventName);

      console.log("Market Name:", marketName);

      console.log("Competition Name:", competitionName);

      console.log("Previous Same Round Match Stake:", previousRoundMatchStake);

      console.log("Exposure Action:", exposureAction);

      console.log("Exposure Change:", exposureChange);

      console.log("Exposure After:", exposureAfter);

      console.log("Wallet Status:", wallet.status);

      console.log("==================================================");

      return res.status(200).json({
        success: true,

        balance: finalBalance,

        message: "SUCCESS",

        data: {
          status: "SUCCESS",

          provider: "ninewicket",

          resultType,

          betAmount,

          winAmount,

          netAmount,

          matchStake,

          previousRoundMatchStake,

          profitLoss,

          eventTypeName,
          eventName,
          marketName,
          competitionName,

          exposureAction,

          exposureChange,

          exposureBalance: exposureAfter,

          balanceBefore: currentBalance,

          newBalance: finalBalance,

          game_round: gameRound,

          serial_number: serialNumber,

          historyId: history._id,
        },
      });
    }

    /* =====================================================
       NORMAL ORACLE GAME CALLBACK
       Existing functionality unchanged.
    ===================================================== */

    const userGamePlayName = cleanedMemberAccount;

    const player = await User.findOne({
      userGamePlayName,
      isActive: true,
    });

    if (!player) {
      return res.status(200).json({
        success: false,
        balance: 0,

        message: "USER_NOT_FOUND",

        data: {
          member_account: rawMemberAccount,

          userGamePlayName,
        },
      });
    }

    const currentBalance = money(player.balance || 0);

    if (currentBalance < betAmount) {
      return res.status(200).json({
        success: false,

        balance: currentBalance,

        message: "INSUFFICIENT_BALANCE",

        data: {
          status: "INSUFFICIENT_BALANCE",

          balance: currentBalance,

          currentBalance,

          betAmount,

          game_round: gameRound,

          serial_number: serialNumber,
        },
      });
    }

    const netAmount = money(winAmount - betAmount);

    let resultType = "push";

    if (netAmount > 0) {
      resultType = "win";
    }

    if (netAmount < 0) {
      resultType = "loss";
    }

    const newBalance = money(currentBalance - betAmount + winAmount);

    const updatedPlayer = await User.findByIdAndUpdate(
      player._id,

      {
        $set: {
          balance: newBalance,
        },
      },

      {
        new: true,
      },
    );

    const finalBalance = money(updatedPlayer.balance || 0);

    const history = await GameHistory.create({
      user: player._id,

      username: player.username,

      userGamePlayName: player.userGamePlayName,

      nineWicketUsername: "",

      provider: "oracle",

      member_account: rawMemberAccount,

      phone: player.phone || "",

      currency: currency_code || player.currency || "BDT",

      userRole: player.role || "user",

      game_uid: gameUId,

      game_round: gameRound,

      serial_number: serialNumber,

      bet_amount: betAmount,

      win_amount: winAmount,

      net_amount: netAmount,

      resultType,

      balance_before: currentBalance,

      balance_after: finalBalance,

      nineWicketBetId: "",

      nineWicketBetStatus: "",

      matchStake: 0,

      profitLoss: 0,

      /**
       * Normal Oracle game-এর জন্য empty।
       */
      eventTypeName: "",
      eventName: "",
      marketName: "",
      competitionName: "",

      exposureChange: 0,

      exposureAfter: 0,

      oracleTimestamp: clean(timestamp),

      rawPayload: req.body || {},
    });

    if (betAmount > 0) {
      await applyTurnoverProgress({
        userId: player._id,

        wagerAmount: betAmount,
      });
    }

    return res.status(200).json({
      success: true,

      balance: finalBalance,

      message: "SUCCESS",

      data: {
        status: "SUCCESS",

        provider: "oracle",

        resultType,

        betAmount,

        winAmount,

        netAmount,

        balanceBefore: currentBalance,

        newBalance: finalBalance,

        game_round: gameRound,

        serial_number: serialNumber,

        historyId: history._id,
      },
    });
  } catch (error) {
    console.error("Callback Error:", error.message);

    if (error?.code === 11000) {
      return res.status(200).json({
        success: false,

        balance: 0,

        message: "DUPLICATE",

        data: {
          status: "DUPLICATE",
        },
      });
    }

    return res.status(200).json({
      success: false,

      balance: 0,

      message: "Internal processing error, but acknowledged",
    });
  }
});

export default router;
