import express from "express";
import GameCategoryColor from "../models/GameCategoryColor.js";

const router = express.Router();

// ✅ Client/Admin: active/latest
router.get("/gamecategory-color", async (req, res) => {
  try {
    const active = await GameCategoryColor.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (active) return res.json(active);

    const latest = await GameCategoryColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin: single upsert (first time create then update same doc)
router.put("/gamecategory-color", async (req, res) => {
  try {
    const existing =
      (await GameCategoryColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await GameCategoryColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await GameCategoryColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await GameCategoryColor.findByIdAndUpdate(
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
