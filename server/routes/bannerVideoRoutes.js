// routes/bannerVideoRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import BannerVideo from "../models/BannerVideo.js";

const router = express.Router();

// ✅ ensure uploads folder exists
const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ✅ image only
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
]);

const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".gif"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : ".bin";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mimeOk = ALLOWED_MIME.has(file.mimetype);
  const extOk = ALLOWED_EXT.has(ext);
  if (mimeOk && extOk) return cb(null, true);
  cb(new Error("Only image files are allowed."), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// delete helper
const deleteIfExists = (fileUrl) => {
  try {
    if (!fileUrl) return;
    if (!fileUrl.startsWith("/uploads/")) return;
    const filePath = path.join(process.cwd(), fileUrl.replace("/uploads/", "uploads/"));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
};

/**
 * ✅ GET /api/banner-videos
 * - client: active only
 * - admin: all
 * query: ?active=true
 */
router.get("/banner-videos", async (req, res) => {
  try {
    const active = req.query.active;

    const filter = {};
    if (active === "true") filter.isActive = true;

    const items = await BannerVideo.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("BannerVideo GET error:", err);
    res.status(500).json({ error: "Server error while fetching banners" });
  }
});

/**
 * ✅ POST /api/banner-videos
 * - create
 * - form-data: bannerImg(file), titleBn, titleEn, youtube, isActive, order
 */
router.post("/banner-videos", upload.single("bannerImg"), async (req, res) => {
  try {
    const { titleBn = "", titleEn = "", youtube = "", isActive = "true", order = "0" } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "bannerImg is required" });
    }

    const item = await BannerVideo.create({
      titleBn,
      titleEn,
      youtube,
      bannerImg: `/${UPLOAD_DIR}/${req.file.filename}`,
      isActive: isActive === "true",
      order: Number(order) || 0,
    });

    res.json({ message: "Banner created", item });
  } catch (err) {
    console.error("BannerVideo POST error:", err);
    res.status(500).json({ error: err?.message || "Server error while creating banner" });
  }
});

/**
 * ✅ PUT /api/banner-videos/:id
 * - update
 * - bannerImg optional
 */
router.put("/banner-videos/:id", upload.single("bannerImg"), async (req, res) => {
  try {
    const { id } = req.params;
    const item = await BannerVideo.findById(id);
    if (!item) return res.status(404).json({ error: "Banner not found" });

    const { titleBn, titleEn, youtube, isActive, order } = req.body;

    if (typeof titleBn === "string") item.titleBn = titleBn;
    if (typeof titleEn === "string") item.titleEn = titleEn;
    if (typeof youtube === "string") item.youtube = youtube;
    if (typeof isActive === "string") item.isActive = isActive === "true";
    if (typeof order === "string") item.order = Number(order) || 0;

    if (req.file) {
      deleteIfExists(item.bannerImg);
      item.bannerImg = `/${UPLOAD_DIR}/${req.file.filename}`;
    }

    await item.save();
    res.json({ message: "Banner updated", item });
  } catch (err) {
    console.error("BannerVideo PUT error:", err);
    res.status(500).json({ error: err?.message || "Server error while updating banner" });
  }
});

/**
 * ✅ DELETE /api/banner-videos/:id
 */
router.delete("/banner-videos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await BannerVideo.findById(id);
    if (!item) return res.status(404).json({ error: "Banner not found" });

    deleteIfExists(item.bannerImg);
    await item.deleteOne();

    res.json({ message: "Banner deleted" });
  } catch (err) {
    console.error("BannerVideo DELETE error:", err);
    res.status(500).json({ error: "Server error while deleting banner" });
  }
});

export default router;
