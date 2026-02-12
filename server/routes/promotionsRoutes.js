// routes/promotionsRoutes.js
import express from "express";
import Promotion from "../models/Promotions.js";
import upload from "../config/multer.js";


const router = express.Router();


/* =========================
   ✅ PUBLIC: GET ALL Promotions
========================= */
router.get("/promotions", async (req, res) => {
  try {
    const list = await Promotion.find().sort({ createdAt: -1 });
    res.json({ success: true, promotions: list });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   ✅ PUBLIC: GET ONE
========================= */
router.get("/promotions/:id", async (req, res) => {
  try {
    const item = await Promotion.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Promotion not found" });
    res.json({ success: true, promotion: item });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   ✅ ADMIN: CREATE
   - multipart: image file optional
   - or imageUrl string optional
========================= */
router.post(
  "/promotions",
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        category,
        titleBn,
        titleEn,
        shortDescBn,
        shortDescEn,
        detailsBn,
        detailsEn,
        imageUrl,
      } = req.body || {};

      const img = req.file ? `/uploads/${req.file.filename}` : (imageUrl || "");

      if (
        !category ||
        !img ||
        !titleBn ||
        !titleEn ||
        !shortDescBn ||
        !shortDescEn ||
        !detailsBn ||
        !detailsEn
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const created = await Promotion.create({
        category,
        image: img,
        title: { bn: titleBn, en: titleEn },
        shortDesc: { bn: shortDescBn, en: shortDescEn },
        details: { bn: detailsBn, en: detailsEn },
      });

      res.status(201).json({ success: true, promotion: created });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/* =========================
   ✅ ADMIN: UPDATE
   - multipart: image file optional
   - or imageUrl string optional
========================= */
router.put(
  "/promotions/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        category,
        titleBn,
        titleEn,
        shortDescBn,
        shortDescEn,
        detailsBn,
        detailsEn,
        imageUrl,
      } = req.body || {};

      const found = await Promotion.findById(req.params.id);
      if (!found) return res.status(404).json({ message: "Promotion not found" });

      // image update: file > imageUrl > keep old
      const img = req.file ? `/uploads/${req.file.filename}` : (imageUrl || found.image);

      // required like your structure (avoid extra logic)
      if (
        !category ||
        !img ||
        !titleBn ||
        !titleEn ||
        !shortDescBn ||
        !shortDescEn ||
        !detailsBn ||
        !detailsEn
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      found.category = category;
      found.image = img;
      found.title = { bn: titleBn, en: titleEn };
      found.shortDesc = { bn: shortDescBn, en: shortDescEn };
      found.details = { bn: detailsBn, en: detailsEn };

      await found.save();

      res.json({ success: true, promotion: found });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/* =========================
   ✅ ADMIN: DELETE
========================= */
router.delete("/promotions/:id", async (req, res) => {
  try {
    const found = await Promotion.findById(req.params.id);
    if (!found) return res.status(404).json({ message: "Promotion not found" });

    await Promotion.deleteOne({ _id: found._id });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
