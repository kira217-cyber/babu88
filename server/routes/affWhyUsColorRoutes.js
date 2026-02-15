// routes/affWhyUsColorRoutes.js
import express from "express";
import AffWhyUsColor from "../models/AffWhyUsColor.js";

const router = express.Router();

// GET /api/aff-whyus-color
router.get("/aff-whyus-color", async (req, res) => {
  try {
    const doc = await AffWhyUsColor.findOne().lean();
    if (!doc) {
      const created = await AffWhyUsColor.create({});
      return res.json(created);
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/aff-whyus-color
router.put("/aff-whyus-color", async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await AffWhyUsColor.findOneAndUpdate(
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
