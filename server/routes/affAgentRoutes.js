import express from "express";
import AffAgent from "../models/AffAgent.js";

const router = express.Router();

/**
 * ✅ Get latest Agent config
 */
router.get("/aff-agent", async (req, res) => {
  try {
    const doc = await AffAgent.findOne().sort({ createdAt: -1 });
    return res.json(doc || null);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err?.message });
  }
});

/**
 * ✅ Create Agent config
 */
router.post("/aff-agent", async (req, res) => {
  try {
    const created = await AffAgent.create(req.body);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({ message: "Create failed", error: err?.message });
  }
});

/**
 * ✅ Update Agent config
 */
router.put("/aff-agent/:id", async (req, res) => {
  try {
    const updated = await AffAgent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: "Update failed", error: err?.message });
  }
});

/**
 * ✅ Delete Agent config
 */
router.delete("/aff-agent/:id", async (req, res) => {
  try {
    const deleted = await AffAgent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: "Delete failed", error: err?.message });
  }
});

export default router;
