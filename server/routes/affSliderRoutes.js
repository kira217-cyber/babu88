import express from "express";
import AffSlider from "../models/AffSlider.js";
import upload from "../config/multer.js"; // ✅ তোমার multer.js

const router = express.Router();

const makeFileUrl = (req, filepath) => {
  const base = `${req.protocol}://${req.get("host")}`;
  const normalized = filepath.replace(/\\/g, "/");
  const justName = normalized.split("uploads/").pop();
  return `${base}/uploads/${justName}`;
};

/**
 * ✅ Upload one image
 * FormData key: image
 * return: { url }
 */
router.post("/aff-slider/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const url = makeFileUrl(req, req.file.path);
    return res.json({ url });
  } catch (err) {
    return res.status(500).json({ message: "Upload failed", error: err?.message });
  }
});

/**
 * ✅ Get latest slider config
 */
router.get("/aff-slider", async (req, res) => {
  try {
    const doc = await AffSlider.findOne().sort({ createdAt: -1 });
    return res.json(doc || null);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err?.message });
  }
});

/**
 * ✅ Create slider config
 */
router.post("/aff-slider", async (req, res) => {
  try {
    const created = await AffSlider.create(req.body); // {slides:[...], autoPlayDelay, loop}
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({ message: "Create failed", error: err?.message });
  }
});

/**
 * ✅ Update slider config
 */
router.put("/aff-slider/:id", async (req, res) => {
  try {
    const updated = await AffSlider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: "Update failed", error: err?.message });
  }
});

/**
 * ✅ Delete slider config
 */
router.delete("/aff-slider/:id", async (req, res) => {
  try {
    const deleted = await AffSlider.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: "Delete failed", error: err?.message });
  }
});

export default router;
