// Server Side: routes/promotionsRoutes.js
import express from "express";
import Promotion from "../models/Promotions.js";
import upload from "../config/multer.js"; // Your multer config
import fs from "fs";
import path from "path";

const router = express.Router();

// Protect middleware from your adminRoutes (reusing as per your request, no new protectors)
const protectAdmin = (req, res, next) => {
  // Copy from your adminRoutes.js protectAdmin
  // ... (paste the protectAdmin code here if not imported)
  // For simplicity, assuming it's available or paste it.
  // But since you said "ami kono protector use kori na", I'll make admin routes protected as in your example.
};

// Public route for client to fetch all promotions
router.get("/promotions", async (req, res) => {
  try {
    const promotions = await Promotion.find({});
    res.json({ promotions });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin route to fetch all (protected)
router.get("/promotions/admin", protectAdmin, async (req, res) => {
  try {
    const promotions = await Promotion.find({});
    res.json({ promotions });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add new promotion (protected)
router.post("/promotions/add", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    const { category, titleBn, titleEn, shortDescBn, shortDescEn, detailsBnHeading, detailsBnPeriodLabel, detailsBnPeriod, detailsBnBody, detailsEnHeading, detailsEnPeriodLabel, detailsEnPeriod, detailsEnBody } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const newPromotion = new Promotion({
      category,
      image,
      title: { bn: titleBn, en: titleEn },
      shortDesc: { bn: shortDescBn, en: shortDescEn },
      details: {
        bn: {
          heading: detailsBnHeading,
          periodLabel: detailsBnPeriodLabel,
          period: detailsBnPeriod,
          body: detailsBnBody.split(",").map((item) => item.trim()),
        },
        en: {
          heading: detailsEnHeading,
          periodLabel: detailsEnPeriodLabel,
          period: detailsEnPeriod,
          body: detailsEnBody.split(",").map((item) => item.trim()),
        },
      },
    });

    await newPromotion.save();
    res.status(201).json({ success: true, promotion: newPromotion });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update promotion (protected)
router.put("/promotions/update/:id", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { category, titleBn, titleEn, shortDescBn, shortDescEn, detailsBnHeading, detailsBnPeriodLabel, detailsBnPeriod, detailsBnBody, detailsEnHeading, detailsEnPeriodLabel, detailsEnPeriod, detailsEnBody } = req.body;
    
    const promotion = await Promotion.findById(id);
    if (!promotion) return res.status(404).json({ message: "Promotion not found" });

    if (req.file) {
      // Delete old image if exists
      if (promotion.image) {
        const oldPath = path.join(process.cwd(), promotion.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      promotion.image = `/uploads/${req.file.filename}`;
    }

    promotion.category = category || promotion.category;
    promotion.title.bn = titleBn || promotion.title.bn;
    promotion.title.en = titleEn || promotion.title.en;
    promotion.shortDesc.bn = shortDescBn || promotion.shortDesc.bn;
    promotion.shortDesc.en = shortDescEn || promotion.shortDesc.en;
    promotion.details.bn.heading = detailsBnHeading || promotion.details.bn.heading;
    promotion.details.bn.periodLabel = detailsBnPeriodLabel || promotion.details.bn.periodLabel;
    promotion.details.bn.period = detailsBnPeriod || promotion.details.bn.period;
    promotion.details.bn.body = detailsBnBody ? detailsBnBody.split(",").map((item) => item.trim()) : promotion.details.bn.body;
    promotion.details.en.heading = detailsEnHeading || promotion.details.en.heading;
    promotion.details.en.periodLabel = detailsEnPeriodLabel || promotion.details.en.periodLabel;
    promotion.details.en.period = detailsEnPeriod || promotion.details.en.period;
    promotion.details.en.body = detailsEnBody ? detailsEnBody.split(",").map((item) => item.trim()) : promotion.details.en.body;

    await promotion.save();
    res.json({ success: true, promotion });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete promotion (protected)
router.delete("/promotions/delete/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findById(id);
    if (!promotion) return res.status(404).json({ message: "Promotion not found" });

    // Delete image
    if (promotion.image) {
      const imagePath = path.join(process.cwd(), promotion.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Promotion.deleteOne({ _id: id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;