// routes/jackpotRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import upload from "../config/multer.js";
import Jackpot from "../models/Jackpot.js";

const router = express.Router();

const safeUnlink = (filePath) => {
  try {
    if (!filePath) return;
    if (!String(filePath).startsWith("/uploads/")) return;
    const full = path.join(process.cwd(), filePath.replace(/^\//, ""));
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch (_) {}
};

const parseBool = (v, def = false) => {
  if (v === undefined || v === null || v === "") return def;
  const s = String(v).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(s)) return true;
  if (["false", "0", "no", "off"].includes(s)) return false;
  return def;
};

const n = (v, def = 0) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : def;
};

// ✅ file fields
const files = upload.fields([
  { name: "bgImage", maxCount: 1 },
  { name: "miniBoxImage", maxCount: 1 },
  { name: "grandBoxImage", maxCount: 1 },
  { name: "majorBoxImage", maxCount: 1 },
]);

// ✅ helper: ensure single config exists
const getOrCreateConfig = async () => {
  let doc = await Jackpot.findOne();
  if (!doc) doc = await Jackpot.create({});
  return doc;
};

// ✅ GET (public/admin both)
router.get("/jackpot", async (req, res) => {
  try {
    const doc = await getOrCreateConfig();
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err?.message || "Server error" });
  }
});

// ✅ UPDATE config (admin)
// send multipart/form-data (images optional)
router.put("/jackpot", files, async (req, res) => {
  try {
    const doc = await getOrCreateConfig();

    const {
      miniAmount,
      grandAmount,
      majorAmount,
      isActive,
      // keep old via checkbox
      keepBg,
      keepMini,
      keepGrand,
      keepMajor,
    } = req.body;

    // amounts
    if (miniAmount !== undefined) doc.miniAmount = n(miniAmount, doc.miniAmount);
    if (grandAmount !== undefined) doc.grandAmount = n(grandAmount, doc.grandAmount);
    if (majorAmount !== undefined) doc.majorAmount = n(majorAmount, doc.majorAmount);
    if (isActive !== undefined) doc.isActive = parseBool(isActive, doc.isActive);

    // images (if uploaded => replace old)
    if (req.files?.bgImage?.[0]?.filename) {
      safeUnlink(doc.bgImage);
      doc.bgImage = `/uploads/${req.files.bgImage[0].filename}`;
    } else if (parseBool(keepBg, true) === false) {
      // if keepBg=false, remove old
      safeUnlink(doc.bgImage);
      doc.bgImage = "";
    }

    if (req.files?.miniBoxImage?.[0]?.filename) {
      safeUnlink(doc.miniBoxImage);
      doc.miniBoxImage = `/uploads/${req.files.miniBoxImage[0].filename}`;
    } else if (parseBool(keepMini, true) === false) {
      safeUnlink(doc.miniBoxImage);
      doc.miniBoxImage = "";
    }

    if (req.files?.grandBoxImage?.[0]?.filename) {
      safeUnlink(doc.grandBoxImage);
      doc.grandBoxImage = `/uploads/${req.files.grandBoxImage[0].filename}`;
    } else if (parseBool(keepGrand, true) === false) {
      safeUnlink(doc.grandBoxImage);
      doc.grandBoxImage = "";
    }

    if (req.files?.majorBoxImage?.[0]?.filename) {
      safeUnlink(doc.majorBoxImage);
      doc.majorBoxImage = `/uploads/${req.files.majorBoxImage[0].filename}`;
    } else if (parseBool(keepMajor, true) === false) {
      safeUnlink(doc.majorBoxImage);
      doc.majorBoxImage = "";
    }

    await doc.save();
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err?.message || "Server error" });
  }
});

export default router;