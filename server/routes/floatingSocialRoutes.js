// routes/floatingSocialRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import FloatingSocial from "../models/FloatingSocial.js";

const router = express.Router();

const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg", ".gif", ".ico"]);

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
  const mime = (file.mimetype || "").toLowerCase();

  const extOk = ALLOWED_EXT.has(ext);
  const mimeOk = mime.startsWith("image/");
  if (extOk || mimeOk) return cb(null, true);

  cb(new Error("Only image files are allowed."), false);
};

// ✅ any() so we can accept icon_0, icon_1 ...
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).any();

const deleteIfExists = (fileUrl) => {
  try {
    if (!fileUrl) return;
    if (!fileUrl.startsWith("/uploads/")) return;
    const filePath = path.join(process.cwd(), fileUrl.replace("/uploads/", "uploads/"));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
};

/**
 * ✅ GET /api/floating-social
 */
router.get("/floating-social", async (req, res) => {
  try {
    let data = await FloatingSocial.findOne();

    if (!data) {
      data = new FloatingSocial(FloatingSocial.getDefault());
      await data.save();
      console.log("Default FloatingSocial created");
    }

    data.items = (data.items || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    res.json(data);
  } catch (err) {
    console.error("FloatingSocial GET error:", err);
    res.status(500).json({ error: "Server error while fetching floating social" });
  }
});

/**
 * ✅ PUT /api/floating-social
 * - multipart/form-data
 * - body.items = JSON string of items array
 * - files fields: icon_0, icon_1, icon_2 ...
 */
router.put("/floating-social", upload, async (req, res) => {
  try {
    const body = req.body || {};
    const rawItems = body.items;

    let incoming = [];
    try {
      incoming = JSON.parse(rawItems || "[]");
      if (!Array.isArray(incoming)) incoming = [];
    } catch {
      incoming = [];
    }

    let doc = await FloatingSocial.findOne();
    if (!doc) doc = new FloatingSocial(FloatingSocial.getDefault());

    const oldItems = doc.items || [];

    // ✅ map uploaded files by fieldname
    const filesMap = new Map();
    (req.files || []).forEach((f) => {
      filesMap.set(f.fieldname, `/${UPLOAD_DIR}/${f.filename}`);
    });

    // ✅ build next items list
    const nextItems = incoming.map((it, idx) => {
      const iconField = `icon_${idx}`;
      const uploadedIconUrl = filesMap.get(iconField);

      // keep old iconUrl if not uploading new
      const oldIconUrl = oldItems?.[idx]?.iconUrl || "";

      return {
        iconUrl: uploadedIconUrl || it.iconUrl || oldIconUrl || "",
        url: typeof it.url === "string" ? it.url : "",
        isActive: it.isActive !== false,
        order: Number(it.order ?? idx) || 0,
      };
    });

    /**
     * ✅ OPTIONAL: delete old files that are no longer used
     */
    const nextIconSet = new Set(nextItems.map((x) => x.iconUrl).filter(Boolean));
    oldItems.forEach((x) => {
      if (x?.iconUrl && !nextIconSet.has(x.iconUrl)) deleteIfExists(x.iconUrl);
    });

    doc.items = nextItems.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    await doc.save();

    res.json({ message: "Floating social saved successfully", data: doc });
  } catch (err) {
    console.error("FloatingSocial PUT error:", err);
    res.status(500).json({ error: err?.message || "Server error while saving floating social" });
  }
});

// ✅ multer error handler
router.use((err, req, res, next) => {
  return res.status(400).json({ error: err?.message || "Upload error" });
});

export default router;
