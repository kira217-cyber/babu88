import express from "express";
import PromotionsColor from "../models/PromotionsColor.js";

const router = express.Router();

router.get("/promotions-color", async (req, res) => {
  try {
    const active = await PromotionsColor.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (active) return res.json(active);

    const latest = await PromotionsColor.findOne().sort({ updatedAt: -1 });
    return res.json(latest || null);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ single upsert: first create then always update same doc
router.put("/promotions-color", async (req, res) => {
  try {
    const existing =
      (await PromotionsColor.findOne({ isActive: true }).sort({ updatedAt: -1 })) ||
      (await PromotionsColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await PromotionsColor.create(req.body || {});
      return res.json(created);
    }

    const updated = await PromotionsColor.findByIdAndUpdate(
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
