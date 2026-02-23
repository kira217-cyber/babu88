// routes/redeemRoutes.js
import express from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/requireAuth.js";
import User from "../models/User.js";
import RedeemSettings from "../models/RedeemSettings.js";
import RedeemHistory from "../models/RedeemHistory.js";
import TurnOver from "../models/TurnOver.js";

const router = express.Router();

const clampNum = (n) => {
  const v = Number(n || 0);
  if (!Number.isFinite(v)) return 0;
  return v;
};

// ✅ Public-ish status (but you can protect it too)
router.get("/status", requireAuth, async (req, res) => {
  try {
    const s = (await RedeemSettings.findOne()) || null;

    return res.json({
      success: true,
      data: {
        enabled: !!s?.enabled,
        minAmount: Number(s?.minAmount || 0),
        maxAmount: Number(s?.maxAmount || 0),
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to load redeem status" });
  }
});

// ✅ Redeem confirm
router.post("/", requireAuth, async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const amount = clampNum(req.body?.amount);

    const settings = await RedeemSettings.findOne();
    if (!settings?.enabled) {
      return res.status(403).json({ success: false, message: "Redeem is currently disabled" });
    }

    const min = Number(settings.minAmount || 0);
    const max = Number(settings.maxAmount || 0); // 0 => no limit

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount required" });
    }
    if (min > 0 && amount < min) {
      return res.status(400).json({ success: false, message: `Minimum redeem amount is ${min}` });
    }
    if (max > 0 && amount > max) {
      return res.status(400).json({ success: false, message: `Maximum redeem amount is ${max}` });
    }

    let createdHistory = null;

    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
      if (user.isActive === false) throw Object.assign(new Error("User inactive"), { statusCode: 403 });

      const walletBefore = Number(user.referCommissionBalance || 0);
      const balanceBefore = Number(user.balance || 0);

      if (walletBefore < amount) {
        throw Object.assign(new Error("Insufficient referral wallet balance"), { statusCode: 400 });
      }

      const walletAfter = walletBefore - amount;
      const balanceAfter = balanceBefore + amount;

      // ✅ 1) create redeem history
      const hist = await RedeemHistory.create(
        [
          {
            user: user._id,
            amount,
            referralWalletBefore: walletBefore,
            referralWalletAfter: walletAfter,
            balanceBefore,
            balanceAfter,
            status: "completed",
          },
        ],
        { session },
      );

      createdHistory = hist?.[0];

      // ✅ 2) update user balances
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            referCommissionBalance: walletAfter,
            balance: balanceAfter,
          },
        },
      ).session(session);

      // ✅ 3) create turnover (1x)
      // required = amount (1x)
      await TurnOver.create(
        [
          {
            user: user._id,
            sourceType: "redeem",
            sourceId: createdHistory._id,
            required: amount, // 1x turnover
            progress: 0,
            status: "running",
            creditedAmount: amount,
          },
        ],
        { session },
      );
    });

    return res.json({
      success: true,
      message: "Redeem successful. Balance updated & turnover created.",
      data: createdHistory,
    });
  } catch (e) {
    const status = e?.statusCode || 500;
    return res.status(status).json({ success: false, message: e?.message || "Redeem failed" });
  } finally {
    session.endSession();
  }
});

// ✅ My redeem history
router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      RedeemHistory.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      RedeemHistory.countDocuments({ user: userId }),
    ]);

    return res.json({ success: true, data: items, meta: { page, limit, total } });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to load redeem history" });
  }
});

// ✅ My single redeem
router.get("/my/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const doc = await RedeemHistory.findOne({ _id: req.params.id, user: userId });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to load redeem details" });
  }
});

export default router;