// routes/siteBrandingRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import SiteBranding from "../models/SiteBranding.js";

const router = express.Router();

const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ✅ allowed ext
const ALLOWED_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
  ".svg",
  ".gif",
  ".ico",
]);

// ✅ allowed mime (best effort; we also allow image/* in filter)
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon", // ✅ ico common
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : ".bin";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

/**
 * ✅ FIXED fileFilter
 * - আগে ছিল: mimeOk && extOk  (mimetype mismatch হলে reject)
 * - এখন: extOk || image/* mimeOk  (safe + practical)
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();

  // (optional debug)
  // console.log("UPLOAD =>", file.originalname, file.mimetype, ext);

  const extOk = ALLOWED_EXT.has(ext);

  // allow any image/* mime (covers weird gif types too)
  const mime = (file.mimetype || "").toLowerCase();
  const mimeOk = mime.startsWith("image/") || ALLOWED_MIME.has(mime);

  if (extOk || mimeOk) return cb(null, true);

  cb(
    new Error(
      "Only image files are allowed (png, jpg, jpeg, webp, avif, svg, gif, ico).",
    ),
    false,
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ 5MB
});

const deleteIfExists = (fileUrl) => {
  try {
    if (!fileUrl) return;
    if (!fileUrl.startsWith("/uploads/")) return;

    // "/uploads/abc.png" -> "uploads/abc.png"
    const filePath = path.join(
      process.cwd(),
      fileUrl.replace("/uploads/", "uploads/"),
    );
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
};

/**
 * ✅ GET /api/site-branding
 * - default create
 */
router.get("/site-branding", async (req, res) => {
  try {
    let data = await SiteBranding.findOne();

    if (!data) {
      data = new SiteBranding(SiteBranding.getDefault());
      await data.save();
      console.log("Default SiteBranding created");
    }

    res.json(data);
  } catch (err) {
    console.error("SiteBranding GET error:", err);
    res.status(500).json({ error: "Server error while fetching branding" });
  }
});

/**
 * ✅ PUT /api/site-branding
 * - multipart/form-data
 * - files: favicon, logo
 */
router.put(
  "/site-branding",
  upload.fields([
    { name: "favicon", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const body = req.body || {};

      let data = await SiteBranding.findOne();
      if (!data) data = new SiteBranding(SiteBranding.getDefault());

      if (typeof body.titleBn === "string") data.titleBn = body.titleBn;
      if (typeof body.titleEn === "string") data.titleEn = body.titleEn;

      if (typeof body.isActive === "string") {
        data.isActive = body.isActive === "true";
      }

      const favicon = req.files?.favicon?.[0];
      const logo = req.files?.logo?.[0];

      if (favicon) {
        deleteIfExists(data.faviconUrl);
        data.faviconUrl = `/${UPLOAD_DIR}/${favicon.filename}`;
      }

      if (logo) {
        deleteIfExists(data.logoUrl);
        data.logoUrl = `/${UPLOAD_DIR}/${logo.filename}`;
      }

      await data.save();
      res.json({ message: "Site branding updated successfully", data });
    } catch (err) {
      console.error("SiteBranding PUT error:", err);
      res
        .status(500)
        .json({
          error: err?.message || "Server error while updating branding",
        });
    }
  },
);

/**
 * ✅ Multer / upload error handler
 * - fileFilter error এখানে সুন্দরভাবে client কে দিবে
 */
router.use((err, req, res, next) => {
  return res.status(400).json({ error: err?.message || "Upload error" });
});

export default router;
