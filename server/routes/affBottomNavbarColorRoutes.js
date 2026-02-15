// routes/affBottomNavbarColorRoutes.js
import express from "express";
import AffBottomNavbarColor from "../models/AffBottomNavbarColor.js";

const router = express.Router();

// GET /api/aff-bottom-navbar-color
router.get("/aff-bottom-navbar-color", async (req, res) => {
  try {
    const doc = await AffBottomNavbarColor.findOne().lean();
    if (!doc) {
      const created = await AffBottomNavbarColor.create({});
      return res.json(created);
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/aff-bottom-navbar-color (upsert)
router.put("/aff-bottom-navbar-color", async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await AffBottomNavbarColor.findOneAndUpdate(
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
