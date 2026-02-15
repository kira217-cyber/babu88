// routes/affNoticeColorRoutes.js
import express from "express";
import AffNoticeColor from "../models/AffNoticeColor.js";

const router = express.Router();

// GET /api/aff-notice-color
router.get("/aff-notice-color", async (req, res) => {
  try {
    const doc = await AffNoticeColor.findOne().lean();
    if (!doc) {
      const created = await AffNoticeColor.create({});
      return res.json(created);
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/aff-notice-color (upsert)
router.put("/aff-notice-color", async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await AffNoticeColor.findOneAndUpdate(
      {},
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
