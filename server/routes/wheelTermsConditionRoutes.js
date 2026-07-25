// routes/wheelTermsConditionRoutes.js

import express from "express";
import WheelTermsCondition from "../models/WheelTermsCondition.js";
import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

const SETTING_KEY = "wheel-terms-condition";

/* ======================================================
   HELPERS
====================================================== */

const parseBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return fallback;
};

const parseNumber = (value, fallback, min, max) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(Math.max(number, min), max);
};

const normalizeColor = (value, fallback) => {
  const color = String(value || fallback).trim();

  return color || fallback;
};

const normalizeTermsData = (body = {}, existingTerms = null) => {
  const titleBn = String(
    body?.title?.bn ?? body?.titleBn ?? existingTerms?.title?.bn ?? "",
  ).trim();

  const titleEn = String(
    body?.title?.en ?? body?.titleEn ?? existingTerms?.title?.en ?? "",
  ).trim();

  const headingBn = String(
    body?.heading?.bn ?? body?.headingBn ?? existingTerms?.heading?.bn ?? "",
  ).trim();

  const headingEn = String(
    body?.heading?.en ?? body?.headingEn ?? existingTerms?.heading?.en ?? "",
  ).trim();

  const contentBn = String(
    body?.content?.bn ?? body?.contentBn ?? existingTerms?.content?.bn ?? "",
  ).trim();

  const contentEn = String(
    body?.content?.en ?? body?.contentEn ?? existingTerms?.content?.en ?? "",
  ).trim();

  if (!titleBn) {
    throw new Error("Bangla title is required");
  }

  if (!titleEn) {
    throw new Error("English title is required");
  }

  if (!headingBn) {
    throw new Error("Bangla heading is required");
  }

  if (!headingEn) {
    throw new Error("English heading is required");
  }

  if (!contentBn) {
    throw new Error("Bangla Terms content is required");
  }

  if (!contentEn) {
    throw new Error("English Terms content is required");
  }

  const oldDesign = existingTerms?.design || {};

  const requestDesign = body?.design || {};

  const design = {
    pageBackgroundColor: normalizeColor(
      requestDesign.pageBackgroundColor ?? body.pageBackgroundColor,
      oldDesign.pageBackgroundColor || "#172178",
    ),

    cardGradientFrom: normalizeColor(
      requestDesign.cardGradientFrom ?? body.cardGradientFrom,
      oldDesign.cardGradientFrom || "#172b88",
    ),

    cardGradientTo: normalizeColor(
      requestDesign.cardGradientTo ?? body.cardGradientTo,
      oldDesign.cardGradientTo || "#4b4b4b",
    ),

    cardBorderColor: normalizeColor(
      requestDesign.cardBorderColor ?? body.cardBorderColor,
      oldDesign.cardBorderColor || "#5364ba",
    ),

    cardBorderWidth: parseNumber(
      requestDesign.cardBorderWidth ?? body.cardBorderWidth,
      Number(oldDesign.cardBorderWidth ?? 1),
      0,
      20,
    ),

    cardBorderRadius: parseNumber(
      requestDesign.cardBorderRadius ?? body.cardBorderRadius,
      Number(oldDesign.cardBorderRadius ?? 18),
      0,
      60,
    ),

    cardShadowColor: normalizeColor(
      requestDesign.cardShadowColor ?? body.cardShadowColor,
      oldDesign.cardShadowColor || "#000000",
    ),

    titleGradientFrom: normalizeColor(
      requestDesign.titleGradientFrom ?? body.titleGradientFrom,
      oldDesign.titleGradientFrom || "#ffb65c",
    ),

    titleGradientTo: normalizeColor(
      requestDesign.titleGradientTo ?? body.titleGradientTo,
      oldDesign.titleGradientTo || "#c79b00",
    ),

    titleBorderColor: normalizeColor(
      requestDesign.titleBorderColor ?? body.titleBorderColor,
      oldDesign.titleBorderColor || "#f5ca24",
    ),

    titleTextColor: normalizeColor(
      requestDesign.titleTextColor ?? body.titleTextColor,
      oldDesign.titleTextColor || "#ffffff",
    ),

    headingTextColor: normalizeColor(
      requestDesign.headingTextColor ?? body.headingTextColor,
      oldDesign.headingTextColor || "#ffffff",
    ),

    contentTextColor: normalizeColor(
      requestDesign.contentTextColor ?? body.contentTextColor,
      oldDesign.contentTextColor || "#ffffff",
    ),

    titleFontSize: parseNumber(
      requestDesign.titleFontSize ?? body.titleFontSize,
      Number(oldDesign.titleFontSize ?? 22),
      12,
      60,
    ),

    headingFontSize: parseNumber(
      requestDesign.headingFontSize ?? body.headingFontSize,
      Number(oldDesign.headingFontSize ?? 15),
      10,
      50,
    ),

    contentFontSize: parseNumber(
      requestDesign.contentFontSize ?? body.contentFontSize,
      Number(oldDesign.contentFontSize ?? 14),
      10,
      40,
    ),

    contentLineHeight: parseNumber(
      requestDesign.contentLineHeight ?? body.contentLineHeight,
      Number(oldDesign.contentLineHeight ?? 1.8),
      1,
      4,
    ),

    maxWidth: parseNumber(
      requestDesign.maxWidth ?? body.maxWidth,
      Number(oldDesign.maxWidth ?? 900),
      300,
      1800,
    ),
  };

  return {
    settingKey: SETTING_KEY,

    title: {
      bn: titleBn,
      en: titleEn,
    },

    heading: {
      bn: headingBn,
      en: headingEn,
    },

    content: {
      bn: contentBn,
      en: contentEn,
    },

    design,

    isActive: parseBoolean(body.isActive, existingTerms?.isActive ?? true),
  };
};

/* ======================================================
   PUBLIC: GET ACTIVE WHEEL TERMS
   GET /api/wheel-terms
====================================================== */

router.get("/wheel-terms", async (req, res) => {
  try {
    const terms = await WheelTermsCondition.findOne({
      settingKey: SETTING_KEY,
      isActive: true,
    }).lean();

    if (!terms) {
      return res.status(404).json({
        success: false,
        message: "Active Wheel Terms & Conditions not found",
      });
    }

    return res.json({
      success: true,
      terms,
    });
  } catch (error) {
    console.error("Get Wheel Terms error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/* ======================================================
   ADMIN: GET WHEEL TERMS
   Active অথবা inactive—দুইটাই Admin দেখতে পারবে।

   GET /api/admin/wheel-terms
====================================================== */

router.get("/admin/wheel-terms", protectAdmin, async (req, res) => {
  try {
    const terms = await WheelTermsCondition.findOne({
      settingKey: SETTING_KEY,
    }).lean();

    return res.json({
      success: true,
      exists: Boolean(terms),
      terms: terms || null,
    });
  } catch (error) {
    console.error("Get Admin Wheel Terms error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/* ======================================================
   ADMIN: CREATE WHEEL TERMS
   শুধু একবার create করা যাবে।

   POST /api/admin/wheel-terms
====================================================== */

router.post("/admin/wheel-terms", protectAdmin, async (req, res) => {
  try {
    const existingTerms = await WheelTermsCondition.findOne({
      settingKey: SETTING_KEY,
    });

    if (existingTerms) {
      return res.status(409).json({
        success: false,
        message:
          "Wheel Terms & Conditions already exists. Please update the existing setting.",
      });
    }

    const termsData = normalizeTermsData(req.body);

    const terms = await WheelTermsCondition.create(termsData);

    return res.status(201).json({
      success: true,
      message: "Wheel Terms & Conditions created successfully",
      terms,
    });
  } catch (error) {
    console.error("Create Wheel Terms error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Wheel Terms & Conditions already exists",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create Wheel Terms & Conditions",
    });
  }
});

/* ======================================================
   ADMIN: UPDATE WHEEL TERMS
   Existing document-টিই update হবে।

   PUT /api/admin/wheel-terms
====================================================== */

router.put("/admin/wheel-terms", protectAdmin, async (req, res) => {
  try {
    const existingTerms = await WheelTermsCondition.findOne({
      settingKey: SETTING_KEY,
    });

    if (!existingTerms) {
      return res.status(404).json({
        success: false,
        message: "Wheel Terms & Conditions not found. Please create it first.",
      });
    }

    const termsData = normalizeTermsData(req.body, existingTerms);

    existingTerms.title = termsData.title;

    existingTerms.heading = termsData.heading;

    existingTerms.content = termsData.content;

    existingTerms.design = termsData.design;

    existingTerms.isActive = termsData.isActive;

    await existingTerms.save();

    return res.json({
      success: true,
      message: "Wheel Terms & Conditions updated successfully",
      terms: existingTerms,
    });
  } catch (error) {
    console.error("Update Wheel Terms error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update Wheel Terms & Conditions",
    });
  }
});

/* ======================================================
   ADMIN: UPDATE STATUS
   PATCH /api/admin/wheel-terms/status

   Body:
   {
     "isActive": true
   }
====================================================== */

router.patch("/admin/wheel-terms/status", protectAdmin, async (req, res) => {
  try {
    const { isActive } = req.body || {};

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const terms = await WheelTermsCondition.findOneAndUpdate(
      {
        settingKey: SETTING_KEY,
      },
      {
        isActive,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!terms) {
      return res.status(404).json({
        success: false,
        message: "Wheel Terms & Conditions not found",
      });
    }

    return res.json({
      success: true,

      message: isActive
        ? "Wheel Terms & Conditions activated successfully"
        : "Wheel Terms & Conditions deactivated successfully",

      terms,
    });
  } catch (error) {
    console.error("Update Wheel Terms status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;
