// routes/userRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import axios from "axios";
import User from "../models/User.js";
import NineWicketWallet from "../models/NineWicketWallet.js";

const router = express.Router();

/* =========================
   helpers
========================= */
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

const safeUser = (u) => ({
  _id: u._id,
  username: u.username,
  email: u.email,
  phone: u.phone,
  role: u.role,
  isActive: u.isActive,
  currency: u.currency,
  balance: u.balance,
  referralCode: u.referralCode,
  createdUsers: u.createdUsers,
  referredBy: u.referredBy,
  referralCount: u.referralCount,
  referralTierOverride: u.referralTierOverride,
  referralTierStats: u.referralTierStats,
  referCommissionBalance: u.referCommissionBalance,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

// ✅ common duplicate key handler
const handleMongoDup = (err) => {
  if (err?.code === 11000) {
    const key = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
    if (key === "username") return "এই username ইতিমধ্যে ব্যবহার করা হয়েছে";
    if (key === "phone") return "এই phone number ইতিমধ্যে ব্যবহার করা হয়েছে";
    if (key === "referralCode") return "referralCode already exists";
    return `${key} already exists`;
  }
  return null;
};

// ✅ referral generator (6 chars)
const genReferralCode = (len = 6) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

// ✅ unique referral maker (avoid collision)
const makeUniqueReferralCode = async (session = null) => {
  for (let i = 0; i < 10; i++) {
    const code = genReferralCode(6);
    const q = User.findOne({ referralCode: code }).select("_id");
    const exists = session ? await q.session(session) : await q;
    if (!exists) return code;
  }
  return `${genReferralCode(6)}${Math.floor(Math.random() * 10)}`;
};

/**
 * ✅ Default tiers that will be auto-saved for every NEW normal user
 * NOTE: amount here is per referral fixed payout
 */
const DEFAULT_USER_TIERS = [
  {
    from: 1,
    to: 10,
    amount: 3,
    label: "Level - 1 (1-10) (per user 3 %)",
    isActive: true,
  },
  {
    from: 11,
    to: 30,
    amount: 5,
    label: "Level - 2 (11-30) (per user 5 %)",
    isActive: true,
  },
  {
    from: 31,
    to: 60,
    amount: 7,
    label: "Level - 3 (31-60) (per user 7 %)",
    isActive: true,
  },
];

// ✅ tier selection for a normal user referrer
const getUserTiers = (referrer) => {
  const override = referrer?.referralTierOverride;
  if (Array.isArray(override)) return override; // null => default, [] => disable
  return null;
};

// ✅ payout by tier (nextCount falls in which tier range)
const getTierPayout = (tiers, nextCount) => {
  if (!Array.isArray(tiers) || tiers.length === 0) return 0;

  const n = Number(nextCount);
  if (!Number.isFinite(n) || n <= 0) return 0;

  const tier = tiers.find(
    (t) => t?.isActive !== false && Number(t.from) <= n && n <= Number(t.to),
  );
  if (!tier) return 0;
  return Number(tier.amount || 0);
};

// ✅ token extract + verify (no middleware)
const getAuthUserId = (req) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token)
    return { ok: false, status: 401, message: "Unauthorized (no token)" };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { ok: true, userId: decoded.id, role: decoded.role };
  } catch {
    return { ok: false, status: 401, message: "Invalid token" };
  }
};

const ORACLE_LAUNCH_KEY = "29f68115e7ded8a4cb4e1a44a9d1890c";

const NINE_WICKET_GET_BALANCE_URL =
  "https://oraclegames.net/api/ninewicket/getbalance";

/**
 * ============================
 * ✅ GET my referral info (single user)
 * GET /api/users/me/referrals
 * headers: Authorization: Bearer <token>
 * ============================
 */
router.get("/me/referrals", async (req, res) => {
  try {
    const auth = getAuthUserId(req);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    const user = await User.findById(auth.userId).select(
      "username role isActive currency referralCode referralCount referralTierOverride referCommissionBalance",
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "user") {
      return res.status(403).json({ message: "Only normal user allowed" });
    }

    if (user.isActive !== true) {
      return res.status(403).json({ message: "Account disabled" });
    }

    return res.json({
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        currency: user.currency,
        referralCode: user.referralCode,
        referralCount: user.referralCount || 0,
        referralTierOverride:
          typeof user.referralTierOverride === "undefined"
            ? null
            : user.referralTierOverride,
        referCommissionBalance: user.referCommissionBalance || 0,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

/**
 * ============================
 * ✅ Get Logged-in User Balance + Sync NineWicket Balance
 * GET /api/users/me/balance
 * headers: Authorization: Bearer <token>
 * ============================
 */
router.get("/me/balance", async (req, res) => {
  try {
    /* =====================================================
       AUTH TOKEN
    ===================================================== */

    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized (no token)",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

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

    /* =====================================================
       FIND USER
    ===================================================== */

    const user = await User.findById(userId).select(
      ["balance", "currency", "role", "isActive", "nineWicketUsername"].join(
        " ",
      ),
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only normal user allowed",
      });
    }

    if (user.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "Account disabled",
      });
    }

    /* =====================================================
       CURRENT MAIN BALANCE
    ===================================================== */

    let currentBalance = Number(user.balance || 0);

    if (!Number.isFinite(currentBalance) || currentBalance < 0) {
      currentBalance = 0;
    }

    currentBalance = Math.trunc(currentBalance * 100) / 100;

    /* =====================================================
       NINE WICKET DEFAULT VALUES
    ===================================================== */

    let nineWicketAmount = 0;
    let nineWicketSynced = false;

    let exposureBalance = 0;
    let totalTransferred = 0;
    let totalReturned = 0;
    let nineWicketStatus = "idle";

    const nineWicketUsername = String(user.nineWicketUsername || "")
      .trim()
      .toLowerCase();

    const validNineWicketUsername = /^[a-z]{6}$/.test(nineWicketUsername);

    /* =====================================================
       LOAD EXISTING NINE WICKET WALLET
    ===================================================== */

    let wallet = await NineWicketWallet.findOne({
      user: user._id,
    });

    if (wallet) {
      totalTransferred = Number(wallet.totalTransferred || 0);

      totalReturned = Number(wallet.totalReturned || 0);

      /**
       * Exposure শুধুমাত্র callback থেকে update হবে।
       */
      exposureBalance = Math.max(0, Number(wallet.exposureBalance || 0));

      nineWicketStatus = wallet.status || "idle";
    }

    /* =====================================================
       NINE WICKET GET BALANCE
    ===================================================== */

    if (validNineWicketUsername) {
      try {
        console.log("========== NINE WICKET GET BALANCE START ==========");

        console.log("User ID:", String(user._id));

        console.log("NineWicket Username:", JSON.stringify(nineWicketUsername));

        console.log("Username Length:", nineWicketUsername.length);

        const payload = {
          username: nineWicketUsername,
        };

        console.log("NineWicket Get Balance Payload:", payload);

        const nineWicketResponse = await axios.post(
          NINE_WICKET_GET_BALANCE_URL,
          payload,
          {
            headers: {
              "Content-Type": "application/json",

              "x-oracle-key": ORACLE_LAUNCH_KEY,
            },

            timeout: 30000,
          },
        );

        console.log(
          "NineWicket Get Balance Response:",
          nineWicketResponse.data,
        );

        const transferStatus = Number(nineWicketResponse.data?.transfer_status);

        const rawGetAmount = Number(nineWicketResponse.data?.get_amount || 0);

        const getAmount =
          Number.isFinite(rawGetAmount) && rawGetAmount > 0
            ? Math.trunc(rawGetAmount * 100) / 100
            : 0;

        /* =================================================
           GET BALANCE SUCCESS
        ================================================= */

        if (transferStatus === 1) {
          nineWicketSynced = true;

          /**
           * API available balance ফেরত দিলে
           * main site balance-এ add হবে।
           */
          if (getAmount > 0) {
            nineWicketAmount = getAmount;

            const updatedUser = await User.findOneAndUpdate(
              {
                _id: user._id,
                isActive: true,
              },

              {
                $inc: {
                  balance: nineWicketAmount,
                },
              },

              {
                new: true,
              },
            ).select("balance currency");

            if (!updatedUser) {
              throw new Error("Failed to update user balance");
            }

            currentBalance = Number(updatedUser.balance || 0);

            if (!Number.isFinite(currentBalance) || currentBalance < 0) {
              currentBalance = 0;
            }

            currentBalance = Math.trunc(currentBalance * 100) / 100;
          }

          /* ===============================================
             UPDATE WALLET SUMMARY
          =============================================== */

          wallet = await NineWicketWallet.findOne({
            user: user._id,
          });

          if (wallet) {
            totalTransferred = Number(wallet.totalTransferred || 0);

            totalReturned = Number(wallet.totalReturned || 0);

            if (getAmount > 0) {
              totalReturned =
                Math.trunc((totalReturned + getAmount) * 100) / 100;
            }

            /**
             * Callback থেকে latest exposure নেওয়া হচ্ছে।
             * এখানে কোনো transferred-returned formula নেই।
             */
            exposureBalance = Math.max(0, Number(wallet.exposureBalance || 0));

            if (exposureBalance > 0) {
              nineWicketStatus = "exposure";
            } else if (getAmount > 0) {
              nineWicketStatus = "settled";
            } else if (wallet.status === "playing") {
              nineWicketStatus = "playing";
            } else {
              nineWicketStatus = wallet.status || "settled";
            }

            wallet.username = nineWicketUsername;

            wallet.totalReturned = totalReturned;

            wallet.lastReturnedAmount = getAmount;

            wallet.lastSyncAt = new Date();

            wallet.status = nineWicketStatus;

            /**
             * Callback-এর exposure value একই থাকবে।
             */
            wallet.exposureBalance = exposureBalance;

            await wallet.save();
          } else {
            /**
             * Wallet না থাকলে safety wallet create হবে।
             */
            wallet = await NineWicketWallet.create({
              user: user._id,

              username: nineWicketUsername,

              totalTransferred: 0,

              totalReturned: getAmount,

              exposureBalance: 0,

              lastTransferAmount: 0,

              lastReturnedAmount: getAmount,

              lastSyncAt: new Date(),

              status: getAmount > 0 ? "settled" : "idle",
            });

            totalTransferred = 0;
            totalReturned = getAmount;
            exposureBalance = 0;

            nineWicketStatus = getAmount > 0 ? "settled" : "idle";
          }
        }

        console.log("NineWicket Synced:", nineWicketSynced);

        console.log("NineWicket Added Amount:", nineWicketAmount);

        console.log("Current Main Balance:", currentBalance);

        console.log("Current Exposure Balance:", exposureBalance);

        console.log("NineWicket Status:", nineWicketStatus);

        console.log("========== NINE WICKET GET BALANCE END ==========");
      } catch (nineWicketError) {
        console.error(
          "NineWicket Get Balance Error:",
          nineWicketError.response?.data || nineWicketError.message,
        );

        /**
         * NineWicket API fail করলেও main balance endpoint
         * সম্পূর্ণ fail করবে না।
         *
         * DB-এর existing balance এবং exposure return করবে।
         */
      }
    } else if (nineWicketUsername) {
      console.error("Invalid NineWicket username:", {
        username: nineWicketUsername,

        length: nineWicketUsername.length,

        valid: false,
      });
    }

    /* =====================================================
       FINAL WALLET REFRESH

       Callback একই সময়ে exposure update করলে latest value
       response-এ দেখানোর জন্য DB থেকে আবার read করা হচ্ছে।
    ===================================================== */

    const latestWallet = await NineWicketWallet.findOne({
      user: user._id,
    }).lean();

    if (latestWallet) {
      totalTransferred = Number(latestWallet.totalTransferred || 0);

      totalReturned = Number(latestWallet.totalReturned || 0);

      exposureBalance = Math.max(0, Number(latestWallet.exposureBalance || 0));

      nineWicketStatus =
        latestWallet.status || (exposureBalance > 0 ? "exposure" : "settled");
    }

    const totalBalance =
      Math.trunc((currentBalance + exposureBalance) * 100) / 100;

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      balance: currentBalance,

      currency: user.currency || "BDT",

      exposureBalance,

      totalBalance,

      nineWicket: {
        username: nineWicketUsername || null,

        usernameValid: validNineWicketUsername,

        synced: nineWicketSynced,

        addedAmount: nineWicketAmount,

        totalTransferred,

        totalReturned,

        exposureBalance,

        status: nineWicketStatus,
      },
    });
  } catch (error) {
    console.error("Get Balance Server Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

router.get("/aff/me/balance", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized (no token)" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = decoded.id;

    const user = await User.findById(userId).select(
      "balance currency role isActive",
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "aff-user") {
      return res.status(403).json({ message: "Only affiliate user allowed" });
    }

    if (user.isActive !== true) {
      return res.status(403).json({ message: "Account disabled" });
    }

    return res.json({
      balance: user.balance || 0,
      currency: user.currency || "BDT",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

/**
 * ============================
 * ✅ Affiliate Register (role: aff-user)
 * POST /api/users/register-aff
 * body: { username, email?, phone, password, currency? }
 * ============================
 */
router.post("/register-aff", async (req, res) => {
  try {
    const {
      username,
      email = "",
      phone,
      password,
      currency = "BDT",
    } = req.body;

    if (!username || !phone || !password) {
      return res
        .status(400)
        .json({ message: "username, phone, password required" });
    }

    const hash = await bcrypt.hash(password, 10);

    const referralCode = await makeUniqueReferralCode();

    const aff = await User.create({
      username: String(username).trim(),
      email,
      phone: String(phone).trim(),
      password: hash,
      currency,
      role: "aff-user",
      referralCode,
      isActive: false,
    });

    const token = signToken(aff);
    return res.json({ token, user: safeUser(aff) });
  } catch (err) {
    const msg = handleMongoDup(err);
    if (msg) return res.status(409).json({ message: msg });
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

/**
 * ============================
 * ✅ Normal User Register (role: user)
 * POST /api/users/register
 * body: { username, phone, password, currency?, referral? }
 *
/**
 * ✅ New logic:
 * - referral code may belong to aff-user OR user
 * - new user gets default referralTierOverride auto saved
 * - payout -> referrer.referCommissionBalance
 * ============================
 */
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      phone,
      password,
      currency = "BDT",
      referral = "",
    } = req.body;

    if (!username || !phone || !password) {
      return res.status(400).json({
        message: "username, phone, password required",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    let referrer = null;
    const ref = String(referral || "")
      .trim()
      .toUpperCase();

    // ✅ referral code can be user or aff-user
    if (ref) {
      referrer = await User.findOne({
        referralCode: ref,
        isActive: true,
        role: { $in: ["user", "aff-user"] },
      });

      if (!referrer) {
        return res.status(400).json({
          message: "Invalid referral code",
        });
      }
    }

    // ✅ new user's referralCode generated
    const myRef = await makeUniqueReferralCode();

    // ✅ create new normal user (auto save default tiers)
    const newUser = await User.create({
      username: String(username).trim(),
      phone: String(phone).trim(),
      password: hash,
      currency,
      role: "user",
      isActive: true,
      referredBy: referrer?._id || null,
      referralCode: myRef,

      // ✅ default tiers auto save for every new normal user
      referralTierOverride: DEFAULT_USER_TIERS.map((x) => ({ ...x })),
    });

    // ✅ if referral used, update referrer with payout
    if (referrer) {
      const currentCount = Number(referrer.referralCount || 0);
      const nextCount = currentCount + 1;

      let payout = 0;

      if (referrer.role === "aff-user") {
        payout = Number(referrer.referCommission || 0);
      } else if (referrer.role === "user") {
        const override = getUserTiers(referrer);

        // if override === null => use DEFAULT_USER_TIERS for payout decision
        // if override === []   => payout 0
        const tiersForPayout =
          override === null ? DEFAULT_USER_TIERS : override;

        payout = getTierPayout(tiersForPayout, nextCount);
      }

      await User.updateOne(
        { _id: referrer._id },
        {
          $addToSet: { createdUsers: newUser._id },
          $inc: {
            referralCount: 1,
            referCommissionBalance: payout,
          },
        },
      );
    }

    const token = signToken(newUser);
    return res.json({ token, user: safeUser(newUser) });
  } catch (err) {
    const msg = handleMongoDup(err);
    if (msg) {
      return res.status(409).json({ message: msg });
    }

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

/**
 * ============================
 * ✅ Affiliate Login (aff-user only) - username + password only
 * POST /api/users/login-aff
 * body: { username, password }
 * ============================
 */
router.post("/login-aff", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password required" });
    }

    const user = await User.findOne({ username: String(username).trim() });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.role !== "aff-user") {
      return res.status(403).json({ message: "Not an affiliate account" });
    }

    if (user.isActive !== true) {
      return res.status(403).json({ message: "Admin not approved for login" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

/**
 * ============================
 * ✅ Normal User Login (user only)
 * POST /api/users/login
 * body: { username, password }
 * ============================
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password required" });
    }

    const uname = String(username).trim();

    const user = await User.findOne({ username: uname });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.role !== "user") {
      return res.status(403).json({ message: "Not a user account" });
    }

    if (user.isActive !== true) {
      return res.status(403).json({ message: "Account disabled" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    return res.json({ token, user: safeUser(user) });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

export default router;
