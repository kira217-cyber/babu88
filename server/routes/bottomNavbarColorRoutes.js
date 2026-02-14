import express from "express";
import BottomNavbarColor from "../models/BottomNavbarColor.js";

const router = express.Router();

// ✅ Public + Admin: get active/latest
router.get("/bottom-navbar-color", async (req, res) => {
  try {
    const active = await BottomNavbarColor.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (active) return res.json(active);

    const latest = await BottomNavbarColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin: single upsert (first create then update same doc)
router.put("/bottom-navbar-color", async (req, res) => {
  try {
    const existing =
      (await BottomNavbarColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await BottomNavbarColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await BottomNavbarColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await BottomNavbarColor.findByIdAndUpdate(
      existing._id,
      { $set: req.body || {} },
      { new: true }
    );

    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ message: "Upsert failed", error: e?.message });
  }
});

export default router;
