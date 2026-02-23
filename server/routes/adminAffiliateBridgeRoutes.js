import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

const n = (v) => {
  const num = Number(v || 0);
  return Number.isFinite(num) ? num : 0;
};

/**
 * ✅ ADMIN: affiliate users list (pagination + search)
 * GET /api/admin/affiliate-bridge/users?page=1&limit=10&q=username
 */
router.get("/affiliate-bridge/users", requireAuth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      50,
    );
    const skip = (page - 1) * limit;

    const q = String(req.query.q || "").trim();

    const match = { role: "aff-user" };
    if (q) match.username = { $regex: q, $options: "i" };

    const [list, total] = await Promise.all([
      User.find(match)
        .select(
          "username phone balance gameLossCommissionBalance depositCommissionBalance referCommissionBalance gameWinCommissionBalance currency createdAt",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(match),
    ]);

    // ✅ response এ gross/net হিসাব করে দিচ্ছি UI তে দেখানোর জন্য
    const data = (list || []).map((u) => {
      const gross =
        n(u.gameLossCommissionBalance) +
        n(u.depositCommissionBalance) +
        n(u.referCommissionBalance);

      const net = gross - n(u.gameWinCommissionBalance);

      return {
        _id: u._id,
        username: u.username,
        phone: u.phone,
        currency: u.currency || "BDT",

        // ✅ now we show wallet balance
        balance: n(u.balance),

        gameLossCommissionBalance: n(u.gameLossCommissionBalance),
        depositCommissionBalance: n(u.depositCommissionBalance),
        referCommissionBalance: n(u.referCommissionBalance),
        gameWinCommissionBalance: n(u.gameWinCommissionBalance),

        gross,
        net,

        createdAt: u.createdAt,
      };
    });

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("affiliate-bridge users error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * ✅ ADMIN: bridge single affiliate
 * POST /api/admin/affiliate-bridge/bridge/:userId
 */
router.post(
  "/affiliate-bridge/bridge/:userId",
  requireAuth,
  async (req, res) => {
    try {
      const { userId } = req.params;
      if (!mongoose.isValidObjectId(userId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid userId" });
      }

      const user = await User.findOne({ _id: userId, role: "aff-user" });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Affiliate user not found" });
      }

      const gameLoss = n(user.gameLossCommissionBalance);
      const deposit = n(user.depositCommissionBalance);
      const refer = n(user.referCommissionBalance);
      const gameWin = n(user.gameWinCommissionBalance);

      const gross = gameLoss + deposit + refer;
      const net = gross - gameWin;

      // ✅ Add directly to USER BALANCE (wallet)
      user.balance = n(user.balance) + net;

      // ✅ Reset all commission balances
      user.gameLossCommissionBalance = 0;
      user.depositCommissionBalance = 0;
      user.referCommissionBalance = 0;
      user.gameWinCommissionBalance = 0;

      await user.save();

      res.json({
        success: true,
        message: "Bridge completed",
        data: {
          userId: user._id,
          username: user.username,
          gross,
          net,
          balance: n(user.balance),
        },
      });
    } catch (err) {
      console.error("affiliate-bridge single error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
);

/**
 * ✅ ADMIN: bridge ALL affiliates (optionally filter by q)
 * POST /api/admin/affiliate-bridge/bridge-all
 * body: { q?: "username" }
 */
router.post("/affiliate-bridge/bridge-all", requireAuth, async (req, res) => {
  try {
    const q = String(req.body?.q || "").trim();
    const match = { role: "aff-user" };
    if (q) match.username = { $regex: q, $options: "i" };

    const users = await User.find(match).select(
      "balance gameLossCommissionBalance depositCommissionBalance referCommissionBalance gameWinCommissionBalance",
    );

    let bridgedUsers = 0;
    let totalGross = 0;
    let totalNet = 0;

    const ops = [];

    for (const user of users) {
      const gameLoss = n(user.gameLossCommissionBalance);
      const deposit = n(user.depositCommissionBalance);
      const refer = n(user.referCommissionBalance);
      const gameWin = n(user.gameWinCommissionBalance);

      const gross = gameLoss + deposit + refer;
      const net = gross - gameWin;

      // ✅ skip if nothing to bridge
      if (gross === 0 && gameWin === 0) continue;

      bridgedUsers += 1;
      totalGross += gross;
      totalNet += net;

      ops.push({
        updateOne: {
          filter: { _id: user._id, role: "aff-user" },
          update: {
            $inc: { balance: net },
            $set: {
              gameLossCommissionBalance: 0,
              depositCommissionBalance: 0,
              referCommissionBalance: 0,
              gameWinCommissionBalance: 0,
            },
          },
        },
      });
    }

    if (ops.length) {
      await User.bulkWrite(ops, { ordered: false });
    }

    res.json({
      success: true,
      message: "Bridge all completed",
      data: {
        bridgedUsers,
        totalGross,
        totalNet,
      },
    });
  } catch (err) {
    console.error("affiliate-bridge all error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
