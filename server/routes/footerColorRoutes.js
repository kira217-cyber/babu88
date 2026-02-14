import express from "express";
import FooterColor from "../models/FooterColor.js";

const router = express.Router();

// ✅ Public/Admin: get active/latest
router.get("/footer-color", async (req, res) => {
  try {
    const active = await FooterColor.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (active) return res.json(active);

    const latest = await FooterColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin: single upsert (first create then update same doc)
router.put("/footer-color", async (req, res) => {
  try {
    const existing =
      (await FooterColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await FooterColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await FooterColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await FooterColor.findByIdAndUpdate(
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
