// routes/affCommissionColorRoutes.js
import express from "express";
import AffCommissionColor from "../models/AffCommissionColor.js";

const router = express.Router();

// GET /api/aff-commission-color
router.get("/aff-commission-color", async (req, res) => {
  try {
    const doc = await AffCommissionColor.findOne().lean();
    if (!doc) {
      const created = await AffCommissionColor.create({});
      return res.json(created);
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/aff-commission-color (upsert)
router.put("/aff-commission-color", async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await AffCommissionColor.findOneAndUpdate(
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
