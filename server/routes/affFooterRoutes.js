import express from "express";
import AffFooter from "../models/AffFooter.js";
import upload from "../config/multer.js"; // ✅ তোমার multer.js

const router = express.Router();

// ✅ helper: make absolute-ish URL
const makeFileUrl = (req, filepath) => {
  // filepath => "uploads/xxx.png"
  const base = `${req.protocol}://${req.get("host")}`;
  const normalized = filepath.replace(/\\/g, "/");
  // serve via /uploads
  const justName = normalized.split("uploads/").pop();
  return `${base}/uploads/${justName}`;
};

/**
 * ✅ Image Upload (single)
 * FormData key: image
 * returns: { url }
 */
router.post("/aff-footer/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const url = makeFileUrl(req, req.file.path);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err?.message });
  }
});

/**
 * ✅ Get latest footer config (one config keep)
 */
router.get("/aff-footer", async (req, res) => {
  try {
    const doc = await AffFooter.findOne().sort({ createdAt: -1 });
    res.json(doc || null);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err?.message });
  }
});

/**
 * ✅ Create new footer config
 */
router.post("/aff-footer", async (req, res) => {
  try {
    const created = await AffFooter.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: "Create failed", error: err?.message });
  }
});

/**
 * ✅ Update footer config
 */
router.put("/aff-footer/:id", async (req, res) => {
  try {
    const updated = await AffFooter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Update failed", error: err?.message });
  }
});

/**
 * ✅ Delete footer config
 */
router.delete("/aff-footer/:id", async (req, res) => {
  try {
    const deleted = await AffFooter.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err?.message });
  }
});

export default router;
