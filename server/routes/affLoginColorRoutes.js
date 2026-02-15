// routes/affLoginColorRoutes.js
import express from "express";
import AffLoginColor from "../models/AffLoginColor.js";

const router = express.Router();

// GET /api/aff-login-color
router.get("/aff-login-color", async (req, res) => {
  try {
    const doc = await AffLoginColor.findOne().lean();
    if (!doc) {
      const created = await AffLoginColor.create({});
      return res.json(created);
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/aff-login-color (upsert)
router.put("/aff-login-color", async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await AffLoginColor.findOneAndUpdate(
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
