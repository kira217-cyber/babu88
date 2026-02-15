// routes/affFooterColorRoutes.js
import express from "express";
import AffFooterColor from "../models/AffFooterColor.js";

const router = express.Router();

/**
 * GET /api/aff-footer-color
 */
router.get("/aff-footer-color", async (req, res) => {
  try {
    const doc = await AffFooterColor.findOne().lean();
    if (!doc) {
      const created = await AffFooterColor.create({});
      return res.json(created);
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * PUT /api/aff-footer-color
 * upsert single config doc
 */
router.put("/aff-footer-color", async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await AffFooterColor.findOneAndUpdate(
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
