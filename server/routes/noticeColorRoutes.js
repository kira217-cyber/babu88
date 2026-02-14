import express from "express";
import NoticeColor from "../models/NoticeColor.js";

const router = express.Router();

// active -> latest -> null
router.get("/notice-color", async (req, res) => {
  try {
    const active = await NoticeColor.findOne({ isActive: true }).sort({
      updatedAt: -1,
    });
    if (active) return res.json(active);

    const latest = await NoticeColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

// upsert (first time create, then update)
router.put("/notice-color", async (req, res) => {
  try {
    const existing =
      (await NoticeColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await NoticeColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await NoticeColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await NoticeColor.findByIdAndUpdate(
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
