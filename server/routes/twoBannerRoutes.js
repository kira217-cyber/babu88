// routes/twoBannerRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import TwoBanner from "../models/TwoBanner.js";

const router = express.Router();

// ✅ ensure uploads folder exists
const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ✅ image allow list
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
 * ✅ GET /api/two-banner
 * - DB empty হলে default create করে দিবে
 */
router.get("/two-banner", async (req, res) => {
  try {
    let data = await TwoBanner.findOne();

    if (!data) {
      data = new TwoBanner(TwoBanner.getDefault());
      await data.save();
      console.log("Default TwoBanner created");
    }

    res.json(data);
  } catch (err) {
    console.error("TwoBanner GET error:", err);
    res.status(500).json({ error: "Server error while fetching TwoBanner" });
  }
});

/**
 * ✅ PUT /api/two-banner
 * - multipart/form-data
 * - fields: leftBanner, rightBanner (optional)
 */
router.put(
  "/two-banner",
  upload.fields([
    { name: "leftBanner", maxCount: 1 },
    { name: "rightBanner", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const body = req.body || {};

      let data = await TwoBanner.findOne();
      if (!data) data = new TwoBanner(TwoBanner.getDefault());

      const setIfString = (k) => {
        if (typeof body[k] === "string") data[k] = body[k];
      };

      [
        "titleBn",
        "titleEn",
        "descriptionBn",
        "descriptionEn",
        "buttonTextBn",
        "buttonTextEn",
        "buttonLink",
      ].forEach(setIfString);

      if (typeof body.openInNewTab === "string") {
        data.openInNewTab = body.openInNewTab === "true";
      }
      if (typeof body.isActive === "string") {
        data.isActive = body.isActive === "true";
      }

      const left = req.files?.leftBanner?.[0];
      const right = req.files?.rightBanner?.[0];

      if (left) {
        deleteIfExists(data.leftBannerUrl);
        data.leftBannerUrl = `/${UPLOAD_DIR}/${left.filename}`;
      }
      if (right) {
        deleteIfExists(data.rightBannerUrl);
        data.rightBannerUrl = `/${UPLOAD_DIR}/${right.filename}`;
      }

      await data.save();
      res.json({ message: "TwoBanner updated successfully", data });
    } catch (err) {
      console.error("TwoBanner PUT error:", err);
      res.status(500).json({ error: err?.message || "Server error while updating TwoBanner" });
    }
  },
);

export default router;
