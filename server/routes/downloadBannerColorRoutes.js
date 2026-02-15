import express from "express";
import DownloadBannerColor from "../models/DownloadBannerColor.js";

const router = express.Router();

router.get("/download-banner-color", async (req, res) => {
  try {
    const active = await DownloadBannerColor.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (active) return res.json(active);

    const latest = await DownloadBannerColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/download-banner-color", async (req, res) => {
  try {
    const existing =
      (await DownloadBannerColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await DownloadBannerColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await DownloadBannerColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await DownloadBannerColor.findByIdAndUpdate(
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
