// routes/withdrawMethodsRoutes.js
import express from "express";
import WithdrawMethod from "../models/WithdrawMethod.js";
import upload from "../config/multer.js";

const router = express.Router();

const toPublicUrl = (file) => {
  if (!file) return "";
  return `/uploads/${file.filename}`;
};

const safeJson = (val, fallback) => {
  try {
    if (val === undefined || val === null) return fallback;
    if (typeof val === "object") return val;
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

const normalizeFields = (fieldsRaw) => {
  if (!Array.isArray(fieldsRaw)) return [];
  return fieldsRaw
    .map((f) => {
      const key = String(f?.key || "").trim();
      const labelBn = String(f?.label?.bn || "").trim();
      const labelEn = String(f?.label?.en || "").trim();

      const phBn = String(f?.placeholder?.bn || "").trim();
      const phEn = String(f?.placeholder?.en || "").trim();

      const type = ["text", "number", "tel", "email"].includes(f?.type)
        ? f.type
        : "text";

      const required = f?.required === false ? false : true;

      if (!key || !labelBn || !labelEn) return null;

      return {
        key,
        label: { bn: labelBn, en: labelEn },
        placeholder: { bn: phBn, en: phEn },
        type,
        required,
      };
    })
    .filter(Boolean);
};

// ✅ GET all
router.get("/withdraw-methods", async (req, res) => {
  try {
    const list = await WithdrawMethod.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: "Failed to load withdraw methods" });
  }
});

// ✅ GET single
router.get("/withdraw-methods/:id", async (req, res) => {
  try {
    const doc = await WithdrawMethod.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ message: "Failed to load withdraw method" });
  }
});

// ✅ CREATE
router.post("/withdraw-methods", upload.single("logo"), async (req, res) => {
  try {
    const body = req.body || {};

    const methodId = String(body.methodId || "")
      .trim()
      .toUpperCase();

    // Deposit style: JSON string parse
    const name = safeJson(body.name, { bn: "", en: "" });
    const fieldsRaw = safeJson(body.fields, []);
    const fields = normalizeFields(fieldsRaw);

    const isActive = body.isActive === "true" || body.isActive === true;

    if (!methodId)
      return res.status(400).json({ message: "methodId is required" });
    if (!String(name?.bn || "").trim() || !String(name?.en || "").trim()) {
      return res
        .status(400)
        .json({ message: "name.bn and name.en are required" });
    }

    const logoUrl = toPublicUrl(req.file);

    const created = await WithdrawMethod.create({
      methodId,
      name,
      fields,
      isActive,
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
router.put("/withdraw-methods/:id", upload.single("logo"), async (req, res) => {
  try {
    const body = req.body || {};
    const doc = await WithdrawMethod.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    const patch = {};

    if (body.methodId != null) {
      patch.methodId = String(body.methodId).trim().toUpperCase();
      if (!patch.methodId)
        return res.status(400).json({ message: "methodId is required" });
    }

    if (body.name != null) {
      const name = safeJson(body.name, null);
      if (!name?.bn?.trim() || !name?.en?.trim()) {
        return res
          .status(400)
          .json({ message: "name.bn and name.en are required" });
      }
      patch.name = name;
    }

    if (body.isActive != null) {
      patch.isActive = body.isActive === "true" || body.isActive === true;
    }

    if (body.fields != null) {
      const fieldsRaw = safeJson(body.fields, []);
      patch.fields = normalizeFields(fieldsRaw);
    }

    if (req.file) patch.logoUrl = toPublicUrl(req.file);

    const updated = await WithdrawMethod.findByIdAndUpdate(
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
router.delete("/withdraw-methods/:id", async (req, res) => {
  try {
    const doc = await WithdrawMethod.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
