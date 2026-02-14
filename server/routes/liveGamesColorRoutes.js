import express from "express";
import LiveGamesColor from "../models/LiveGamesColor.js";

const router = express.Router();

// ✅ Public/Admin: get active/latest
router.get("/livegames-color", async (req, res) => {
  try {
    const active = await LiveGamesColor.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (active) return res.json(active);

    const latest = await LiveGamesColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin: single upsert (first create then update same doc)
router.put("/livegames-color", async (req, res) => {
  try {
    const existing =
      (await LiveGamesColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await LiveGamesColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await LiveGamesColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await LiveGamesColor.findByIdAndUpdate(
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
