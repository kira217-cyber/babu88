// routes/affNavbarColorRoutes.js
import express from "express";
import AffNavbarColor from "../models/AffNavbarColor.js";

const router = express.Router();

/**
 * GET /api/aff-navbar-color
 * Single config doc
 */
router.get("/aff-navbar-color", async (req, res) => {
  try {
    const doc = await AffNavbarColor.findOne().lean();
    // If not exists, return defaults by creating one (optional)
    if (!doc) {
      const created = await AffNavbarColor.create({});
      return res.json(created);
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * PUT /api/aff-navbar-color
 * Upsert config (single doc)
 */
router.put("/aff-navbar-color", async (req, res) => {
  try {
    const payload = req.body || {};

    const updated = await AffNavbarColor.findOneAndUpdate(
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
