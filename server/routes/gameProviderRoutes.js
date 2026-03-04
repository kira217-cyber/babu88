// routes/gameProviderRoutes.js


import express from "express";
import path from "path";
import fs from "fs";
import upload from "../config/multer.js";
import GameProvider from "../models/GameProvider.js";

const router = express.Router();

const safeUnlink = (filePath) => {
  try {
    if (!filePath) return;
    const full = path.join(process.cwd(), filePath.replace(/^\//, ""));
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch (_) {}
};

const files = upload.fields([
  { name: "providerImage", maxCount: 1 },
  { name: "providerIcon", maxCount: 1 },
]);

// ✅ helper: parse boolean coming from multipart/form-data
const parseBool = (v, def = false) => {
  if (v === undefined || v === null || v === "") return def;
  const s = String(v).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(s)) return true;
  if (["false", "0", "no", "off"].includes(s)) return false;
  return def;
};

// CREATE provider under a category
router.post("/", files, async (req, res) => {
  try {
    const { categoryId, providerId, providerName, status, isHot, isNew } =
      req.body;

    if (!categoryId)
      return res
        .status(400)
        .json({ success: false, message: "categoryId required" });

    if (!providerId || !providerName) {
      return res.status(400).json({
        success: false,
        message: "providerId & providerName required",
      });
    }

    const providerImage = req.files?.providerImage?.[0]?.filename
      ? `/uploads/${req.files.providerImage[0].filename}`
      : "";

    const providerIcon = req.files?.providerIcon?.[0]?.filename
      ? `/uploads/${req.files.providerIcon[0].filename}`
      : "";

    const doc = await GameProvider.create({
      categoryId,
      providerId,
      providerName,
      providerImage,
      providerIcon,
      status: status || "active",

      // ✅ NEW
      isHot: parseBool(isHot, false),
      isNew: parseBool(isNew, false),
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err?.message || "Server error" });
  }
});

// GET providers (optional filter by categoryId)
router.get("/", async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = categoryId ? { categoryId } : {};
    const list = await GameProvider.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err?.message || "Server error" });
  }
});

// UPDATE
router.put("/:id", files, async (req, res) => {
  try {
    const doc = await GameProvider.findById(req.params.id);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Provider not found" });

    const { categoryId, providerId, providerName, status, isHot, isNew } =
      req.body;

    if (categoryId) doc.categoryId = categoryId;
    if (providerId) doc.providerId = providerId;
    if (providerName) doc.providerName = providerName;
    if (status) doc.status = status;

    // ✅ NEW (only change if value sent)
    if (isHot !== undefined) doc.isHot = parseBool(isHot, doc.isHot);
    if (isNew !== undefined) doc.isNew = parseBool(isNew, doc.isNew);

    if (req.files?.providerImage?.[0]?.filename) {
      safeUnlink(doc.providerImage);
      doc.providerImage = `/uploads/${req.files.providerImage[0].filename}`;
    }

    if (req.files?.providerIcon?.[0]?.filename) {
      safeUnlink(doc.providerIcon);
      doc.providerIcon = `/uploads/${req.files.providerIcon[0].filename}`;
    }

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err?.message || "Server error" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const doc = await GameProvider.findById(req.params.id);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Provider not found" });

    safeUnlink(doc.providerImage);
    safeUnlink(doc.providerIcon);

    await doc.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err?.message || "Server error" });
  }
});

export default router;
