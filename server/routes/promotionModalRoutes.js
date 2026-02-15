import express from "express";
import PromotionModal from "../models/PromotionModal.js";
import upload from "../config/multer.js"; // ✅ your multer path

const router = express.Router();

const pickActiveOrLatest = async () => {
  const active = await PromotionModal.findOne({ isActive: true }).sort({ updatedAt: -1 });
  if (active) return active;
  return await PromotionModal.findOne().sort({ updatedAt: -1 });
};

// ✅ client fetch
router.get("/promotion-modal", async (req, res) => {
  try {
    const doc = await pickActiveOrLatest();
    return res.json(doc || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ admin upsert
router.put("/promotion-modal", async (req, res) => {
  try {
    const existing = await pickActiveOrLatest();

    if (!existing) {
      const created = await PromotionModal.create(req.body || {});
      return res.json(created);
    }

    const updated = await PromotionModal.findByIdAndUpdate(
      existing._id,
      { $set: req.body || {} },
      { new: true },
    );
    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ message: "Update failed", error: e?.message });
  }
});

// ✅ image upload (multer)
router.post("/promotion-modal/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file?.filename) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const filePath = `/uploads/${req.file.filename}`;

    // save to active/latest config automatically
    const existing = await pickActiveOrLatest();
    let doc;

    if (!existing) {
      doc = await PromotionModal.create({ imageUrl: filePath });
    } else {
      doc = await PromotionModal.findByIdAndUpdate(
        existing._id,
        { $set: { imageUrl: filePath } },
        { new: true },
      );
    }

    return res.json({
      message: "Uploaded",
      imageUrl: filePath,
      doc,
    });
  } catch (e) {
    return res.status(500).json({ message: "Upload failed", error: e?.message });
  }
});

export default router;
