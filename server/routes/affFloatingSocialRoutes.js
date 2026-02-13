// routes/affFloatingSocial.js
import express from "express";
import AffFloatingSocial from "../models/AffFloatingSocial.js";
import upload from "../config/multer.js"; // আপনার multer config

const router = express.Router();

// Helper function to generate full URL from file path
const makeFileUrl = (req, filepath) => {
  const base = `${req.protocol}://${req.get("host")}`;
  const normalized = filepath.replace(/\\/g, "/");
  const justName = normalized.split("uploads/").pop();
  return `${base}/uploads/${justName}`;
};

/**
 * @route   POST /api/aff-floating-social/upload
 * @desc    Upload a single image for floating social icon
 * @access  Private (admin)
 * @body    FormData with key "image"
 */
router.post(
  "/aff-floating-social/upload",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const url = makeFileUrl(req, req.file.path);
      return res.status(200).json({ url });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({
        message: "Image upload failed",
        error: err.message,
      });
    }
  },
);

/**
 * @route   GET /api/aff-floating-social
 * @desc    Get all floating social icons (sorted by newest first)
 * @access  Public (or Private - depending on your need)
 */
router.get("/aff-floating-social", async (req, res) => {
  try {
    const icons = await AffFloatingSocial.find()
      .sort({ createdAt: -1 }) // newest first
      .lean(); // faster response (optional)

    return res.status(200).json(icons);
  } catch (err) {
    console.error("Get all icons error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   POST /api/aff-floating-social
 * @desc    Create a new floating social icon
 * @access  Private (admin)
 * @body    { imageUrl: string, linkUrl: string }
 */
router.post("/aff-floating-social", async (req, res) => {
  try {
    const { imageUrl, linkUrl } = req.body;

    if (!imageUrl || !linkUrl) {
      return res
        .status(400)
        .json({ message: "imageUrl and linkUrl are required" });
    }

    const newIcon = await AffFloatingSocial.create({
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl.trim(),
    });

    return res.status(201).json(newIcon);
  } catch (err) {
    console.error("Create icon error:", err);
    return res.status(400).json({
      message: "Failed to create floating icon",
      error: err.message,
    });
  }
});

/**
 * @route   PUT /api/aff-floating-social/:id
 * @desc    Update an existing floating social icon
 * @access  Private (admin)
 * @param   :id - MongoDB _id of the icon
 * @body    { imageUrl?: string, linkUrl?: string }
 */
router.put("/aff-floating-social/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.imageUrl) updates.imageUrl = req.body.imageUrl.trim();
    if (req.body.linkUrl) updates.linkUrl = req.body.linkUrl.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedIcon = await AffFloatingSocial.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!updatedIcon) {
      return res.status(404).json({ message: "Floating icon not found" });
    }

    return res.status(200).json(updatedIcon);
  } catch (err) {
    console.error("Update icon error:", err);
    return res.status(400).json({
      message: "Failed to update floating icon",
      error: err.message,
    });
  }
});

/**
 * @route   DELETE /api/aff-floating-social/:id
 * @desc    Delete a floating social icon
 * @access  Private (admin)
 * @param   :id - MongoDB _id of the icon
 */
router.delete("/aff-floating-social/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedIcon = await AffFloatingSocial.findByIdAndDelete(id);

    if (!deletedIcon) {
      return res.status(404).json({ message: "Floating icon not found" });
    }

    return res.status(200).json({
      message: "Floating icon deleted successfully",
      deletedId: id,
    });
  } catch (err) {
    console.error("Delete icon error:", err);
    return res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
