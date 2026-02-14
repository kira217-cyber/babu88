import express from "express";
import NavbarColor from "../models/NavbarColor.js";

const router = express.Router();

// ✅ client + admin: get single config (latest / active)
router.get("/navbar-color", async (req, res) => {
  try {
    const active = await NavbarColor.findOne({ isActive: true }).sort({
      updatedAt: -1,
    });
    if (active) return res.json(active);

    const latest = await NavbarColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ admin: upsert (no need create/update separately)
router.put("/navbar-color", async (req, res) => {
  try {
    // find one doc (prefer active, else any)
    const existing =
      (await NavbarColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await NavbarColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      // first time create
      const created = await NavbarColor.create(req.body || {});
      return res.json(created);
    }

    // update the existing
    const updated = await NavbarColor.findByIdAndUpdate(
      existing._id,
      { $set: req.body || {} },
      { new: true },
    );
    return res.json(updated);
  } catch (e) {
    return res
      .status(400)
      .json({ message: "Upsert failed", error: e?.message });
  }
});

export default router;
