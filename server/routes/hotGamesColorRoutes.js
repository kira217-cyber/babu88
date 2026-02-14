import express from "express";
import HotGamesColor from "../models/HotGamesColor.js";

const router = express.Router();

// GET: active -> latest -> null
router.get("/hotgames-color", async (req, res) => {
  try {
    const active = await HotGamesColor.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (active) return res.json(active);

    const latest = await HotGamesColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT upsert: first time create, then update
router.put("/hotgames-color", async (req, res) => {
  try {
    const existing =
      (await HotGamesColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await HotGamesColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await HotGamesColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await HotGamesColor.findByIdAndUpdate(
      existing._id,
      { $set: req.body || {} },
      { new: true }
    );

    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ message: "Upsert failed", error: e?.message });
  }
});

export default router;
