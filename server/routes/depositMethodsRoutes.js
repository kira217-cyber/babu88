// routes/depositMethodsRoutes.js
import express from "express";
import DepositMethod from "../models/DepositMethods.js";
import upload from "../config/multer.js";

const router = express.Router();

const toPublicUrl = (req, file) => {
  if (!file) return "";
  return `/uploads/${file.filename}`;
};

// ✅ GET all
router.get("/deposit-methods", async (req, res) => {
  try {
    const list = await DepositMethod.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: "Failed to load deposit methods" });
  }
});

// ✅ GET single
router.get("/deposit-methods/:id", async (req, res) => {
  try {
    const doc = await DepositMethod.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: "Failed to load deposit method" });
  }
});

// ✅ CREATE
router.post("/deposit-methods", upload.single("logo"), async (req, res) => {
  try {
    const body = req.body || {};

    const parsed = {
      methodId: (body.methodId || "").toLowerCase().trim(),
      methodName: body.methodName
        ? JSON.parse(body.methodName)
        : { bn: "", en: "" },
      isActive: body.isActive === "true" || body.isActive === true,

      // ✅ NEW
      minDepositAmount: Number(body.minDepositAmount ?? 0),
      maxDepositAmount: Number(body.maxDepositAmount ?? 0),

      turnoverMultiplier: Number(body.turnoverMultiplier ?? 1),
      baseBonusTitle: body.baseBonusTitle
        ? JSON.parse(body.baseBonusTitle)
        : { bn: "", en: "" },
      baseBonusPercent: Number(body.baseBonusPercent ?? 0),
      channels: body.channels ? JSON.parse(body.channels) : [],
      promotions: body.promotions ? JSON.parse(body.promotions) : [],
      details: body.details ? JSON.parse(body.details) : {},
    };

    if (!parsed.methodId) {
      return res.status(400).json({ message: "methodId is required" });
    }

    // ✅ sanitize min/max (optional safe-guard)
    if (Number.isNaN(parsed.minDepositAmount) || parsed.minDepositAmount < 0) {
      parsed.minDepositAmount = 0;
    }
    if (Number.isNaN(parsed.maxDepositAmount) || parsed.maxDepositAmount < 0) {
      parsed.maxDepositAmount = 0;
    }
    // (No hard validation required; but you can add if you want later)

    // ✅ sanitize promotions
    if (Array.isArray(parsed.promotions)) {
      parsed.promotions = parsed.promotions
        .map((p) => ({
          ...p,
          id: String(p?.id || "")
            .toLowerCase()
            .trim(),
          bonusValue: Number(p?.bonusValue ?? 0),
          sort: Number(p?.sort ?? 0),
          isActive: p?.isActive !== false,
          bonusType: p?.bonusType === "percent" ? "percent" : "fixed",
        }))
        .filter((p) => p.id);
    } else {
      parsed.promotions = [];
    }

    const logoUrl = toPublicUrl(req, req.file);

    const created = await DepositMethod.create({
      ...parsed,
      logoUrl,
    });

    res.status(201).json(created);
  } catch (e) {
    const msg =
      e?.code === 11000
        ? "methodId already exists"
        : e?.message || "Create failed";
    res.status(400).json({ message: msg });
  }
});

// ✅ UPDATE
router.put("/deposit-methods/:id", upload.single("logo"), async (req, res) => {
  try {
    const body = req.body || {};
    const doc = await DepositMethod.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const patch = {};

    if (body.methodId != null)
      patch.methodId = String(body.methodId).toLowerCase().trim();
    if (body.methodName != null) patch.methodName = JSON.parse(body.methodName);
    if (body.isActive != null)
      patch.isActive = body.isActive === "true" || body.isActive === true;

    // ✅ NEW
    if (body.minDepositAmount != null) {
      const v = Number(body.minDepositAmount);
      patch.minDepositAmount = Number.isNaN(v) ? 0 : v;
    }
    if (body.maxDepositAmount != null) {
      const v = Number(body.maxDepositAmount);
      patch.maxDepositAmount = Number.isNaN(v) ? 0 : v;
    }

    if (body.turnoverMultiplier != null)
      patch.turnoverMultiplier = Number(body.turnoverMultiplier);
    if (body.baseBonusTitle != null)
      patch.baseBonusTitle = JSON.parse(body.baseBonusTitle);
    if (body.baseBonusPercent != null)
      patch.baseBonusPercent = Number(body.baseBonusPercent);
    if (body.channels != null) patch.channels = JSON.parse(body.channels);

    // ✅ promotions
    if (body.promotions != null) {
      let promotions = JSON.parse(body.promotions);
      if (!Array.isArray(promotions)) promotions = [];
      promotions = promotions
        .map((p) => ({
          ...p,
          id: String(p?.id || "")
            .toLowerCase()
            .trim(),
          bonusValue: Number(p?.bonusValue ?? 0),
          sort: Number(p?.sort ?? 0),
          isActive: p?.isActive !== false,
          bonusType: p?.bonusType === "percent" ? "percent" : "fixed",
        }))
        .filter((p) => p.id);
      patch.promotions = promotions;
    }

    if (body.details != null) patch.details = JSON.parse(body.details);

    if (req.file) patch.logoUrl = toPublicUrl(req, req.file);

    const updated = await DepositMethod.findByIdAndUpdate(
      req.params.id,
      { $set: patch },
      { new: true },
    );

    res.json(updated);
  } catch (e) {
    const msg =
      e?.code === 11000
        ? "methodId already exists"
        : e?.message || "Update failed";
    res.status(400).json({ message: msg });
  }
});

// ✅ DELETE
router.delete("/deposit-methods/:id", async (req, res) => {
  try {
    const doc = await DepositMethod.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
