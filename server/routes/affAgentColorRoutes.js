// routes/affAgentColorRoutes.js
import express from "express";
import AffAgentColor from "../models/AffAgentColor.js";

const router = express.Router();

// GET /api/aff-agent-color
router.get("/aff-agent-color", async (req, res) => {
  try {
    const doc = await AffAgentColor.findOne().lean();
    if (!doc) {
      const created = await AffAgentColor.create({});
      return res.json(created);
    }
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/aff-agent-color (upsert)
router.put("/aff-agent-color", async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await AffAgentColor.findOneAndUpdate(
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
