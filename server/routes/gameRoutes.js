// routes/gameRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import upload from "../config/multer.js";
import Game from "../models/Game.js";

const router = express.Router();

const safeUnlink = (filePath) => {
  try {
    if (!filePath) return;
    const full = path.join(process.cwd(), filePath.replace(/^\//, ""));
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch (_) {}
};

// ✅ Create (select game) — now accepts & saves gameName
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      categoryId,
      providerDbId,
      gameId,
      gameUuid,
      gameName,           // ← NEW
      isHot,
      isNew,
      status,
    } = req.body;

    if (!categoryId || !providerDbId) {
      return res.status(400).json({ success: false, message: "categoryId & providerDbId required" });
    }
    if (!gameId) {
      return res.status(400).json({ success: false, message: "gameId required" });
    }

    const image = req.file?.filename ? `/uploads/${req.file.filename}` : "";

    const doc = await Game.create({
      categoryId,
      providerDbId,
      gameId,
      gameUuid: gameUuid || "",
      gameName: gameName || "",               // ← NEW
      image,
      isHot: String(isHot) === "true",
      isNew: String(isNew) === "true",
      status: status || "active",
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.code === 11000
        ? "This game is already selected for this provider"
        : (err?.message || "Server error"),
    });
  }
});



// ✅ Get selected games (filter by providerDbId or categoryId)
router.get("/", async (req, res) => {
  try {
    const { providerDbId, categoryId } = req.query;
    const filter = {};
    if (providerDbId) filter.providerDbId = providerDbId;
    if (categoryId) filter.categoryId = categoryId;

    const list = await Game.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
});

// ✅ Update — also allow updating gameName (optional — mostly for future admin edit)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const doc = await Game.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Game not found" });

    const { isHot, isNew, status, gameName } = req.body;   // ← gameName optional

    if (typeof isHot !== "undefined") doc.isHot = String(isHot) === "true";
    if (typeof isNew !== "undefined") doc.isNew = String(isNew) === "true";
    if (status) doc.status = status;
    if (gameName !== undefined) doc.gameName = gameName.trim();   // ← NEW (optional)

    if (req.file?.filename) {
      safeUnlink(doc.image);
      doc.image = `/uploads/${req.file.filename}`;
    }

    await doc.save();
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
});

// ✅ Delete selected game
router.delete("/:id", async (req, res) => {
  try {
    const doc = await Game.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Game not found" });

    safeUnlink(doc.image);
    await doc.deleteOne();

    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || "Server error" });
  }
});

export default router;