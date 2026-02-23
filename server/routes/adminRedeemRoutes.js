// routes/adminRedeemRoutes.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import RedeemSettings from "../models/RedeemSettings.js";
import RedeemHistory from "../models/RedeemHistory.js";

const router = express.Router();

// ✅ get current settings
router.get("/settings", requireAuth, async (req, res) => {
  try {
    let s = await RedeemSettings.findOne();
    if (!s) s = await RedeemSettings.create({ enabled: false, minAmount: 100, maxAmount: 0 });

    return res.json({
      success: true,
      data: {
        enabled: !!s.enabled,
        minAmount: Number(s.minAmount || 0),
        maxAmount: Number(s.maxAmount || 0),
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to load settings" });
  }
});

// ✅ update settings
router.put("/settings", requireAuth, async (req, res) => {
  try {
    const enabled = !!req.body?.enabled;
    const minAmount = Number(req.body?.minAmount || 0);
    const maxAmount = Number(req.body?.maxAmount || 0);

    if (!Number.isFinite(minAmount) || minAmount < 0) {
      return res.status(400).json({ success: false, message: "minAmount invalid" });
    }
    if (!Number.isFinite(maxAmount) || maxAmount < 0) {
      return res.status(400).json({ success: false, message: "maxAmount invalid" });
    }
    if (maxAmount > 0 && maxAmount < minAmount) {
      return res.status(400).json({ success: false, message: "maxAmount must be >= minAmount (or 0)" });
    }

    let s = await RedeemSettings.findOne();
    if (!s) s = await RedeemSettings.create({ enabled, minAmount, maxAmount });
    else {
      s.enabled = enabled;
      s.minAmount = minAmount;
      s.maxAmount = maxAmount;
      await s.save();
    }

    return res.json({ success: true, message: "Redeem settings updated", data: s });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to update settings" });
  }
});

// ✅ admin list redeem histories
router.get("/history", requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      RedeemHistory.find({})
        .populate("user", "username phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RedeemHistory.countDocuments({}),
    ]);

    return res.json({ success: true, data: items, meta: { page, limit, total } });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Failed to load redeem history" });
  }
});

export default router;