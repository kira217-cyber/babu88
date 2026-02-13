import express from "express";
import AffWhyUs from "../models/AffWhyUs.js";

const router = express.Router();

/**
 * ✅ Get latest WhyUs config
 */
router.get("/aff-whyus", async (req, res) => {
  try {
    const doc = await AffWhyUs.findOne().sort({ createdAt: -1 });
    return res.json(doc || null);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err?.message });
  }
});

/**
 * ✅ Create WhyUs config
 */
router.post("/aff-whyus", async (req, res) => {
  try {
    const created = await AffWhyUs.create(req.body);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({ message: "Create failed", error: err?.message });
  }
});

/**
 * ✅ Update WhyUs config
 */
router.put("/aff-whyus/:id", async (req, res) => {
  try {
    const updated = await AffWhyUs.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: "Update failed", error: err?.message });
  }
});

/**
 * ✅ Delete WhyUs config
 */
router.delete("/aff-whyus/:id", async (req, res) => {
  try {
    const deleted = await AffWhyUs.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: "Delete failed", error: err?.message });
  }
});

export default router;
