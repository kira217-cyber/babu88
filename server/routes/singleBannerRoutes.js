// routes/singleBannerRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import SingleBanner from "../models/SingleBanner.js";

const router = express.Router();

const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

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

const deleteIfExists = (fileUrl) => {
  try {
    if (!fileUrl) return;
    if (!fileUrl.startsWith("/uploads/")) return;
    const filePath = path.join(process.cwd(), fileUrl.replace("/uploads/", "uploads/"));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
};

/**
 * ✅ GET /api/single-banner
 * - না থাকলে default create
 */
router.get("/single-banner", async (req, res) => {
  try {
    let data = await SingleBanner.findOne();

    if (!data) {
      data = new SingleBanner(SingleBanner.getDefault());
      await data.save();
      console.log("Default SingleBanner created");
    }

    res.json(data);
  } catch (err) {
    console.error("SingleBanner GET error:", err);
    res.status(500).json({ error: "Server error while fetching single banner" });
  }
});

/**
 * ✅ PUT /api/single-banner
 * - multipart/form-data
 * - file: bannerImg (optional)
 * - fields: clickLink, openInNewTab, isActive
 */
router.put("/single-banner", upload.single("bannerImg"), async (req, res) => {
  try {
    const body = req.body || {};

    let data = await SingleBanner.findOne();
    if (!data) data = new SingleBanner(SingleBanner.getDefault());

    if (typeof body.clickLink === "string") data.clickLink = body.clickLink;
    if (typeof body.openInNewTab === "string")
      data.openInNewTab = body.openInNewTab === "true";
    if (typeof body.isActive === "string") data.isActive = body.isActive === "true";

    if (req.file) {
      deleteIfExists(data.bannerUrl);
      data.bannerUrl = `/${UPLOAD_DIR}/${req.file.filename}`;
    }

    await data.save();
    res.json({ message: "Single banner updated successfully", data });
  } catch (err) {
    console.error("SingleBanner PUT error:", err);
    res.status(500).json({ error: err?.message || "Server error while updating banner" });
  }
});

export default router;
