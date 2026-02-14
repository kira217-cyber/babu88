import express from "express";
import MenuItemsColor from "../models/MenuItemsColor.js";

const router = express.Router();

// ✅ Public + Admin: get active/latest
router.get("/menuitems-color", async (req, res) => {
  try {
    const active = await MenuItemsColor.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (active) return res.json(active);

    const latest = await MenuItemsColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin: upsert (first time create, then update)
router.put("/menuitems-color", async (req, res) => {
  try {
    const existing =
      (await MenuItemsColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await MenuItemsColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await MenuItemsColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await MenuItemsColor.findByIdAndUpdate(
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
