import express from "express";
import TwoBannerColor from "../models/TwoBannerColor.js";

const router = express.Router();

router.get("/two-banner-color", async (req, res) => {
  try {
    const active = await TwoBannerColor.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (active) return res.json(active);

    const latest = await TwoBannerColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/two-banner-color", async (req, res) => {
  try {
    const existing =
      (await TwoBannerColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await TwoBannerColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await TwoBannerColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await TwoBannerColor.findByIdAndUpdate(
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
