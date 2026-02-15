import express from "express";
import LoginColor from "../models/LoginColor.js";

const router = express.Router();

router.get("/login-color", async (req, res) => {
  try {
    const active = await LoginColor.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (active) return res.json(active);

    const latest = await LoginColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/login-color", async (req, res) => {
  try {
    const existing =
      (await LoginColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await LoginColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await LoginColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await LoginColor.findByIdAndUpdate(
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
