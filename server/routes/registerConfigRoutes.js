import express from "express";
import RegisterConfig from "../models/RegisterConfig.js";
import upload from "../config/multer.js";

const router = express.Router();

const getLatest = async () => {
  const doc = await RegisterConfig.findOne().sort({ updatedAt: -1 });
  return doc;
};

// ✅ client fetch
router.get("/register-config", async (req, res) => {
  try {
    const doc = await getLatest();
    return res.json(doc || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ admin upsert
router.put("/register-config", async (req, res) => {
  try {
    const doc = await getLatest();
    if (!doc) {
      const created = await RegisterConfig.create(req.body || {});
      return res.json(created);
    }

    const updated = await RegisterConfig.findByIdAndUpdate(
      doc._id,
      { $set: req.body || {} },
      { new: true },
    );

    return res.json(updated);
  } catch (e) {
    return res
      .status(400)
      .json({ message: "Update failed", error: e?.message });
  }
});

// ✅ upload mobile banner
router.post(
  "/register-config/upload-mobile-banner",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file?.filename)
        return res.status(400).json({ message: "No image uploaded" });

      const filePath = `/uploads/${req.file.filename}`;
      const doc = await getLatest();

      const saved = doc
        ? await RegisterConfig.findByIdAndUpdate(
            doc._id,
            { $set: { mobileBannerUrl: filePath } },
            { new: true },
          )
        : await RegisterConfig.create({ mobileBannerUrl: filePath });

      return res.json({
        message: "Uploaded",
        mobileBannerUrl: filePath,
        doc: saved,
      });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "Upload failed", error: e?.message });
    }
  },
);

// ✅ upload desktop banner
router.post(
  "/register-config/upload-desktop-banner",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file?.filename)
        return res.status(400).json({ message: "No image uploaded" });

      const filePath = `/uploads/${req.file.filename}`;
      const doc = await getLatest();

      const saved = doc
        ? await RegisterConfig.findByIdAndUpdate(
            doc._id,
            { $set: { desktopBannerUrl: filePath } },
            { new: true },
          )
        : await RegisterConfig.create({ desktopBannerUrl: filePath });

      return res.json({
        message: "Uploaded",
        desktopBannerUrl: filePath,
        doc: saved,
      });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "Upload failed", error: e?.message });
    }
  },
);

export default router;
