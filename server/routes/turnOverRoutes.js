// routes/turnOverRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import TurnOver from "../models/TurnOver.js";

const router = express.Router();

/* auth */
const requireAuth = (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ success: false, message: "Admin only" });
  next();
};

/* USER: my turnovers */
router.get("/turnovers/my", requireAuth, async (req, res) => {
  try {
    const status = String(req.query.status || "").trim(); // running/completed
    const filter = { user: req.user.id };
    if (status && ["running", "completed"].includes(status)) filter.status = status;

    const items = await TurnOver.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, message: e?.message || "Server error" });
  }
});

/* ADMIN: list turnovers */
router.get("/admin/turnovers", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
    const skip = (page - 1) * limit;

    const status = String(req.query.status || "").trim();
    const filter = {};
    if (status && ["running", "completed"].includes(status)) filter.status = status;

    const [items, total] = await Promise.all([
      TurnOver.find(filter)
        .populate("user", "username phone")
        .populate("depositRequest")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TurnOver.countDocuments(filter),
    ]);

    res.json({ success: true, data: items, meta: { page, limit, total } });
  } catch (e) {
    res.status(500).json({ success: false, message: e?.message || "Server error" });
  }
});

/* ADMIN: update progress (optional manual) */
router.post("/admin/turnovers/:id/progress", requireAuth, requireAdmin, async (req, res) => {
  try {
    const add = Number(req.body.add || 0);
    if (!Number.isFinite(add) || add <= 0) {
      return res.status(400).json({ success: false, message: "Invalid add amount" });
    }

    const doc = await TurnOver.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    if (doc.status === "completed") return res.status(400).json({ success: false, message: "Already completed" });

    doc.progress = Number(doc.progress || 0) + add;
    if (doc.progress >= doc.required) {
      doc.status = "completed";
      doc.completedAt = new Date();
    }
    await doc.save();

    res.json({ success: true, message: "Updated", data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e?.message || "Server error" });
  }
});

export default router;