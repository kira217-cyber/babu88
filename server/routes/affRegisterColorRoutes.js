// routes/affRegisterColorRoutes.js
import express from "express";
import AffRegisterColor from "../models/AffRegisterColor.js";

const router = express.Router();

// GET /api/aff-register-color
router.get("/aff-register-color", async (req, res) => {
  try {
    const doc = await AffRegisterColor.findOne().lean();
    if (!doc) {
      const created = await AffRegisterColor.create({});
      return res.json(created);
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/aff-register-color (upsert)
router.put("/aff-register-color", async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await AffRegisterColor.findOneAndUpdate(
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
