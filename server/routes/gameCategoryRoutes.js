// routes/gameCategoryRoutes.js
import express from "express";
import path from "path";
import fs from "fs";
import upload from "../config/multer.js";
import GameCategory from "../models/GameCategory.js";

const router = express.Router();

const safeUnlink = (filePath) => {
  try {
    if (!filePath) return;
    const full = path.join(process.cwd(), filePath.replace(/^\//, ""));
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch (_) {}
};

const toInt = (v) => {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? Math.floor(n) : null;
};

// ✅ helper: auto next order (max + 1)
const getNextOrder = async () => {
  const last = await GameCategory.findOne().sort({ order: -1 }).select("order");
  const maxOrder = Number(last?.order || 0);
  return maxOrder + 1;
};

// ─── CREATE ────────────────────────────────────────────────
router.post(
  "/",
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "iconImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        categoryNameBn,
        categoryNameEn,
        categoryTitleBn,
        categoryTitleEn,
        status,
        order, // ✅ NEW
      } = req.body;

      const bannerImage = req.files?.bannerImage?.[0]?.filename
        ? `/uploads/${req.files.bannerImage[0].filename}`
        : "";

      const iconImage = req.files?.iconImage?.[0]?.filename
        ? `/uploads/${req.files.iconImage[0].filename}`
        : "";

      // ✅ order: if not provided -> auto next
      let orderNum = toInt(order);
      if (!orderNum || orderNum <= 0) {
        orderNum = await getNextOrder();
      }

      const doc = await GameCategory.create({
        categoryName: { bn: categoryNameBn || "", en: categoryNameEn || "" },
        categoryTitle: { bn: categoryTitleBn || "", en: categoryTitleEn || "" },
        bannerImage,
        iconImage,
        order: orderNum, // ✅ NEW
        status: status || "active",
      });

      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err?.message || "Server error",
      });
    }
  },
);

// ─── GET ALL ───────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    // ✅ sort by order asc, then newest
    const list = await GameCategory.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err?.message || "Server error" });
  }
});

// ─── UPDATE ────────────────────────────────────────────────
router.put(
  "/:id",
  upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "iconImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const doc = await GameCategory.findById(req.params.id);
      if (!doc)
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });

      const {
        categoryNameBn,
        categoryNameEn,
        categoryTitleBn,
        categoryTitleEn,
        status,
        order, // ✅ NEW
      } = req.body;

      doc.categoryName = {
        bn: categoryNameBn ?? doc.categoryName?.bn ?? "",
        en: categoryNameEn ?? doc.categoryName?.en ?? "",
      };
      doc.categoryTitle = {
        bn: categoryTitleBn ?? doc.categoryTitle?.bn ?? "",
        en: categoryTitleEn ?? doc.categoryTitle?.en ?? "",
      };

      if (status) doc.status = status;

      // ✅ order update (only if provided and valid)
      const orderNum = toInt(order);
      if (orderNum !== null) {
        doc.order = orderNum <= 0 ? 0 : orderNum;
      }

      // Banner update
      if (req.files?.bannerImage?.[0]?.filename) {
        safeUnlink(doc.bannerImage);
        doc.bannerImage = `/uploads/${req.files.bannerImage[0].filename}`;
      }

      // Icon update
      if (req.files?.iconImage?.[0]?.filename) {
        safeUnlink(doc.iconImage);
        doc.iconImage = `/uploads/${req.files.iconImage[0].filename}`;
      }

      await doc.save();
      res.json({ success: true, data: doc });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: err?.message || "Server error" });
    }
  },
);

// ─── DELETE ────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const doc = await GameCategory.findById(req.params.id);
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    safeUnlink(doc.bannerImage);
    safeUnlink(doc.iconImage);

    await doc.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err?.message || "Server error" });
  }
});

export default router;
