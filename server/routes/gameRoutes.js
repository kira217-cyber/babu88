// routes/gameRoutes.js


import express from "express";
import path from "path";
import fs from "fs";
import upload from "../config/multer.js";
import Game from "../models/Game.js";

const router = express.Router();

const isRemoteUrl = (v = "") => /^https?:\/\//i.test(String(v || ""));

// ✅ only unlink local uploads path like "/uploads/xxx.png"
const safeUnlink = (filePath) => {
  try {
    if (!filePath) return;

    // ✅ don't try to delete remote urls
    if (isRemoteUrl(filePath)) return;

    // ✅ only delete uploads files
    if (!String(filePath).startsWith("/uploads/")) return;

    const full = path.join(process.cwd(), filePath.replace(/^\//, ""));
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch (_) {}
};

// ✅ helper: parse bool from multipart/form-data safely
const parseBool = (v, def = false) => {
  if (v === undefined || v === null || v === "") return def;
  const s = String(v).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(s)) return true;
  if (["false", "0", "no", "off"].includes(s)) return false;
  return def;
};

// ✅ Create (select game)
// ✅ FIXED: now supports saving remote oracle image url when no upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      categoryId,
      providerDbId,
      gameId,
      gameUuid,
      gameName,
      isHot,
      isNew,
      isJackpot, // ✅ NEW
      status,
      imageUrl, // ✅ oracle remote image url (string)
    } = req.body;

    if (!categoryId || !providerDbId) {
      return res.status(400).json({
        success: false,
        message: "categoryId & providerDbId required",
      });
    }
    if (!gameId) {
      return res
        .status(400)
        .json({ success: false, message: "gameId required" });
    }

    // ✅ image priority:
    // 1) uploaded file -> "/uploads/xxx.png"
    // 2) imageUrl string -> "https://....png"
    // 3) ""
    let image = "";
    if (req.file?.filename) {
      image = `/uploads/${req.file.filename}`;
    } else if (typeof imageUrl === "string" && imageUrl.trim()) {
      image = imageUrl.trim();
    }

    const doc = await Game.create({
      categoryId,
      providerDbId,
      gameId,
      gameUuid: gameUuid || "",
      gameName: (gameName || "").trim(),
      image,

      isHot: parseBool(isHot, false),
      isNew: parseBool(isNew, false),

      // ✅ NEW
      isJackpot: parseBool(isJackpot, false),

      status: status || "active",
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message:
        err?.code === 11000
          ? "This game is already selected for this provider"
          : err?.message || "Server error",
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
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

// ✅ Update
// ✅ remote url থাকলে unlink skip করবে
// ✅ upload করলে: image becomes "/uploads/xxx.png"
// ✅ upload না করলে: image unchanged
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const doc = await Game.findById(req.params.id);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });

    const { isHot, isNew, isJackpot, status, gameName } = req.body;

    if (typeof isHot !== "undefined") doc.isHot = parseBool(isHot, doc.isHot);
    if (typeof isNew !== "undefined") doc.isNew = parseBool(isNew, doc.isNew);

    // ✅ NEW
    if (typeof isJackpot !== "undefined")
      doc.isJackpot = parseBool(isJackpot, doc.isJackpot);

    if (status) doc.status = status;
    if (gameName !== undefined) doc.gameName = String(gameName || "").trim();

    if (req.file?.filename) {
      // ✅ delete old local upload only (won't touch remote)
      safeUnlink(doc.image);
      doc.image = `/uploads/${req.file.filename}`;
    }

    await doc.save();
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

// ✅ Delete selected game
router.delete("/:id", async (req, res) => {
  try {
    const doc = await Game.findById(req.params.id);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });

    safeUnlink(doc.image);
    await doc.deleteOne();

    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

export default router;
