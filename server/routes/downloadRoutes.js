// routes/downloadRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import Download from "../models/Download.js";

const router = express.Router();

// ✅ ensure uploads folder exists
const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ✅ allow: images + apk
const IMG_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
]);

const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".gif"]);

const APK_MIME = new Set([
  "application/vnd.android.package-archive",
  "application/octet-stream", // কিছু ব্রাউজার/সার্ভার এ apk এটাও দেয়
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt =
      IMG_EXT.has(ext) || ext === ".apk" ? ext : ".bin";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();

  // image check
  const isImage = IMG_MIME.has(file.mimetype) && IMG_EXT.has(ext);

  // apk check
  const isApk = (APK_MIME.has(file.mimetype) || ext === ".apk") && ext === ".apk";

  if (isImage || isApk) return cb(null, true);

  cb(new Error("Only image files and .apk are allowed."), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // ✅ 100MB (apk বড় হতে পারে)
});

// helper: delete old file if exists
const deleteIfExists = (fileUrl) => {
  try {
    if (!fileUrl) return;
    // example url: /uploads/xxx.apk
    const filePath = fileUrl.startsWith("/uploads/")
      ? path.join(process.cwd(), fileUrl.replace("/uploads/", "uploads/"))
      : null;

    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.log("File delete skip:", e?.message);
  }
};

/**
 * ✅ GET /api/download-banner
 * - default create if not exists
 */
router.get("/download-banner", async (req, res) => {
  try {
    let data = await Download.findOne();

    if (!data) {
      data = new Download(Download.getDefault());
      await data.save();
      console.log("Default download banner created");
    }

    res.json(data);
  } catch (err) {
    console.error("DownloadBanner GET error:", err);
    res.status(500).json({ error: "Server error while fetching download banner" });
  }
});

/**
 * ✅ PUT /api/download-banner
 * - multipart/form-data
 * - files: apkFile, rightImage
 */
router.put(
  "/download-banner",
  upload.fields([
    { name: "apkFile", maxCount: 1 },
    { name: "rightImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const body = req.body || {};

      let data = await Download.findOne();
      if (!data) data = new Download(Download.getDefault());

      // ✅ text fields (safe set)
      const setIfString = (key) => {
        if (typeof body[key] === "string") data[key] = body[key];
      };

      [
        "titleBn",
        "titleEn",
        "subBn",
        "subEn",
        "btnDownloadBn",
        "btnDownloadEn",
        "btnAndroidBn",
        "btnAndroidEn",
      ].forEach(setIfString);

      // ✅ boolean
      if (typeof body.isActive === "string") {
        data.isActive = body.isActive === "true";
      }

      // ✅ files
      const apk = req.files?.apkFile?.[0];
      const img = req.files?.rightImage?.[0];

      if (apk) {
        // old file delete
        deleteIfExists(data.apkUrl);
        data.apkUrl = `/${UPLOAD_DIR}/${apk.filename}`;
      }

      if (img) {
        deleteIfExists(data.rightImageUrl);
        data.rightImageUrl = `/${UPLOAD_DIR}/${img.filename}`;
      }

      await data.save();

      res.json({ message: "Download banner updated successfully", data });
    } catch (err) {
      console.error("DownloadBanner PUT error:", err);
      res.status(500).json({ error: err?.message || "Server error while updating" });
    }
  },
);

export default router;
