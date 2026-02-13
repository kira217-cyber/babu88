import express from "express";
import AffCommission from "../models/AffCommission.js";

const router = express.Router();

/**
 * ✅ GET active commission (client site will use this)
 * GET /api/aff-commission/active
 */
router.get("/aff-commission/active", async (req, res) => {
  try {
    const doc = await AffCommission.findOne({ isActive: true }).sort({
      createdAt: -1,
    });

    if (!doc) return res.status(404).json({ message: "No active commission" });

    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ✅ GET all (admin list)
 * GET /api/aff-commission
 */
router.get("/aff-commission", async (req, res) => {
  try {
    const list = await AffCommission.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ✅ GET by id (admin edit open)
 * GET /api/aff-commission/:id
 */
router.get("/aff-commission/:id", async (req, res) => {
  try {
    const doc = await AffCommission.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ✅ CREATE (admin create)
 * POST /api/aff-commission
 */
router.post("/aff-commission", async (req, res) => {
  try {
    // যদি নতুনটা active করা হয়, পুরোনো active গুলো off করে দাও
    if (req.body?.isActive === true) {
      await AffCommission.updateMany({ isActive: true }, { isActive: false });
    }

    const created = await AffCommission.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: "Bad request", error: err.message });
  }
});

/**
 * ✅ UPDATE (admin update)
 * PUT /api/aff-commission/:id
 */
router.put("/aff-commission/:id", async (req, res) => {
  try {
    if (req.body?.isActive === true) {
      await AffCommission.updateMany({ isActive: true }, { isActive: false });
    }

    const updated = await AffCommission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Bad request", error: err.message });
  }
});

/**
 * ✅ DELETE (admin delete)
 * DELETE /api/aff-commission/:id
 */
router.delete("/aff-commission/:id", async (req, res) => {
  try {
    const deleted = await AffCommission.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
