import express from "express";
import DownloadHeaderColor from "../models/DownloadHeaderColor.js";

const router = express.Router();

router.get("/download-header-color", async (req, res) => {
  try {
    const active = await DownloadHeaderColor.findOne({ isActive: true }).sort({
      updatedAt: -1,
    });
    if (active) return res.json(active);

    const latest = await DownloadHeaderColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/download-header-color", async (req, res) => {
  try {
    const existing =
      (await DownloadHeaderColor.findOne({ isActive: true }).sort({
        updatedAt: -1,
      })) || (await DownloadHeaderColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await DownloadHeaderColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await DownloadHeaderColor.findByIdAndUpdate(
      existing._id,
      { $set: req.body || {} },
      { new: true },
    );

    return res.json(updated);
  } catch (e) {
    return res
      .status(400)
      .json({ message: "Upsert failed", error: e?.message });
  }
});

export default router;
