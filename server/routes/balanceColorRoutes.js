import express from "express";
import BalanceColor from "../models/BalanceColor.js";

const router = express.Router();

router.get("/balance-color", async (req, res) => {
  try {
    const active = await BalanceColor.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (active) return res.json(active);

    const latest = await BalanceColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/balance-color", async (req, res) => {
  try {
    const existing =
      (await BalanceColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await BalanceColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await BalanceColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await BalanceColor.findByIdAndUpdate(
      existing._id,
      { $set: req.body || {} },
      { new: true },
    );

    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ message: "Upsert failed", error: e?.message });
  }
});

export default router;
