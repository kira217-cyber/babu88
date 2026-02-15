// routes/affSliderColorRoutes.js
import express from "express";
import AffSliderColor from "../models/AffSliderColor.js";

const router = express.Router();

// GET /api/aff-slider-color
router.get("/aff-slider-color", async (req, res) => {
  try {
    const doc = await AffSliderColor.findOne().lean();
    if (!doc) {
      const created = await AffSliderColor.create({});
      return res.json(created);
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/aff-slider-color
router.put("/aff-slider-color", async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await AffSliderColor.findOneAndUpdate(
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
