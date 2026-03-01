// routes/sliderRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import Slider from "../models/Slider.js";
import upload from "../config/multer.js";

const router = express.Router();

// ✅ helper: /uploads/abc.png => abc.png
const getFilenameFromUrl = (imageUrl) => {
  if (!imageUrl) return null;
  const parts = imageUrl.split("/");
  return parts[parts.length - 1] || null;
};

// ✅ helper: safely delete file
const deleteFileIfExists = (imageUrl) => {
  try {
    const filename = getFilenameFromUrl(imageUrl);
    if (!filename) return;

    const filePath = path.join(process.cwd(), "uploads", filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    // ignore
  }
};

/* =========================
   ✅ Public: client slider list (active only)
========================= */
router.get("/", async (req, res) => {
  try {
    const sliders = await Slider.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({ success: true, sliders });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   ✅ Admin panel list (all)
========================= */
router.get("/all", async (req, res) => {
  try {
    const sliders = await Slider.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json({ success: true, sliders });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   ✅ Create slider (upload desktop+mobile)
   form-data:
    - imageDesktop (required)
    - imageMobile (required)
    - order? active?
========================= */
router.post(
  "/",
  upload.fields([
    { name: "imageDesktop", maxCount: 1 },
    { name: "imageMobile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const desktopFile = req.files?.imageDesktop?.[0];
      const mobileFile = req.files?.imageMobile?.[0];

      if (!desktopFile || !mobileFile) {
        return res.status(400).json({
          message: "Both imageDesktop and imageMobile are required",
        });
      }

      const { order = 0, active = "true" } = req.body;

      const slider = await Slider.create({
        imageUrlDesktop: `/uploads/${desktopFile.filename}`,
        imageUrlMobile: `/uploads/${mobileFile.filename}`,
        order: Number(order) || 0,
        active: active === "true" || active === true,
      });

      res
        .status(201)
        .json({ success: true, message: "✅ Slider created", slider });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

/* =========================
   ✅ Update slider
   - order/active update
   - desktop/mobile image replace optional
   form-data:
    - imageDesktop? imageMobile? order? active?
========================= */
router.put(
  "/:id",
  upload.fields([
    { name: "imageDesktop", maxCount: 1 },
    { name: "imageMobile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const slider = await Slider.findById(req.params.id);
      if (!slider) return res.status(404).json({ message: "Slider not found" });

      const { order, active } = req.body;

      if (order !== undefined) slider.order = Number(order) || 0;
      if (active !== undefined)
        slider.active = active === "true" || active === true;

      const desktopFile = req.files?.imageDesktop?.[0];
      const mobileFile = req.files?.imageMobile?.[0];

      // ✅ replace desktop
      if (desktopFile) {
        deleteFileIfExists(slider.imageUrlDesktop);
        slider.imageUrlDesktop = `/uploads/${desktopFile.filename}`;
      }

      // ✅ replace mobile
      if (mobileFile) {
        deleteFileIfExists(slider.imageUrlMobile);
        slider.imageUrlMobile = `/uploads/${mobileFile.filename}`;
      }

      await slider.save();

      res.json({ success: true, message: "✅ Slider updated", slider });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  },
);

/* =========================
   ✅ Delete slider (db + files)
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) return res.status(404).json({ message: "Slider not found" });

    deleteFileIfExists(slider.imageUrlDesktop);
    deleteFileIfExists(slider.imageUrlMobile);

    await slider.deleteOne();

    res.json({ success: true, message: "✅ Slider deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
