// routes/liveGamesRoutes.js
import express from "express";
import LiveGame from "../models/LiveGame.js";
import upload from "../config/multer.js";

const router = express.Router();

/**
 * OPTIONAL: upload image
 * Frontend form-data: key = "image"
 * Returns: { url: "/uploads/xxx.png" }
 */
router.post("/live-games/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    return res.json({ url: `/${req.file.path.replace(/\\/g, "/")}` });
  } catch (e) {
    return res.status(500).json({ message: "Upload failed", error: e.message });
  }
});

/**
 * GET all live games
 */
router.get("/live-games", async (req, res) => {
  try {
    const list = await LiveGame.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (e) {
    return res.status(500).json({ message: "Failed to load live games", error: e.message });
  }
});

/**
 * GET single by gameUID (for blank page later)
 */
router.get("/live-games/by-uid/:gameUID", async (req, res) => {
  try {
    const doc = await LiveGame.findOne({ gameUID: req.params.gameUID });
    if (!doc) return res.status(404).json({ message: "Game not found" });
    return res.json(doc);
  } catch (e) {
    return res.status(500).json({ message: "Failed", error: e.message });
  }
});

/**
 * POST create
 */
router.post("/live-games", async (req, res) => {
  try {
    const created = await LiveGame.create(req.body);
    return res.status(201).json(created);
  } catch (e) {
    // duplicate gameUID
    if (e?.code === 11000) {
      return res.status(409).json({ message: "gameUID already exists" });
    }
    return res.status(400).json({ message: "Create failed", error: e.message });
  }
});

/**
 * PUT update by _id
 */
router.put("/live-games/:id", async (req, res) => {
  try {
    const updated = await LiveGame.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: "gameUID already exists" });
    }
    return res.status(400).json({ message: "Update failed", error: e.message });
  }
});

/**
 * DELETE by _id
 */
router.delete("/live-games/:id", async (req, res) => {
  try {
    const deleted = await LiveGame.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Deleted" });
  } catch (e) {
    return res.status(500).json({ message: "Delete failed", error: e.message });
  }
});

export default router;
