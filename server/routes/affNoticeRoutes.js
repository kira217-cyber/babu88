import express from "express";
import AffNotice from "../models/AffNotice.js";

const router = express.Router();

/**
 * ✅ Get latest Notice config
 */
router.get("/aff-notice", async (req, res) => {
  try {
    const doc = await AffNotice.findOne().sort({ createdAt: -1 });
    return res.json(doc || null);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err?.message });
  }
});

/**
 * ✅ Create Notice config
 */
router.post("/aff-notice", async (req, res) => {
  try {
    const created = await AffNotice.create(req.body);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({ message: "Create failed", error: err?.message });
  }
});

/**
 * ✅ Update Notice config
 */
router.put("/aff-notice/:id", async (req, res) => {
  try {
    const updated = await AffNotice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: "Update failed", error: err?.message });
  }
});

/**
 * ✅ Delete Notice config
 */
router.delete("/aff-notice/:id", async (req, res) => {
  try {
    const deleted = await AffNotice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: "Delete failed", error: err?.message });
  }
});

export default router;
