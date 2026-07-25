import express from "express";
import HotGamesColor from "../models/HotGamesColor.js";
import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

const cleanPayload = (body = {}) => {
  const payload = { ...body };

  delete payload._id;
  delete payload.__v;
  delete payload.createdAt;
  delete payload.updatedAt;

  return payload;
};

// GET active/latest config
router.get("/hotgames-color", async (req, res) => {
  try {
    const active = await HotGamesColor.findOne({ isActive: true }).sort({
      updatedAt: -1,
    });

    if (active) return res.json(active);

    const latest = await HotGamesColor.findOne().sort({ updatedAt: -1 });

    return res.json(latest || null);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load hot games color config",
      error: error?.message,
    });
  }
});

// PUT create/update latest config
router.put("/hotgames-color", protectAdmin, async (req, res) => {
  try {
    const payload = cleanPayload(req.body);

    const existing =
      (await HotGamesColor.findOne({ isActive: true }).sort({
        updatedAt: -1,
      })) || (await HotGamesColor.findOne().sort({ updatedAt: -1 }));

    if (!existing) {
      const created = await HotGamesColor.create(payload);

      return res.json({
        success: true,
        message: "Hot games color config created",
        data: created,
        ...created.toObject(),
      });
    }

    const updated = await HotGamesColor.findByIdAndUpdate(
      existing._id,
      { $set: payload },
      {
        new: true,
        runValidators: true,
      },
    );

    return res.json({
      success: true,
      message: "Hot games color config updated",
      data: updated,
      ...updated.toObject(),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Hot games color config update failed",
      error: error?.message,
    });
  }
});

// Optional: reset default
router.delete("/hotgames-color", protectAdmin, async (req, res) => {
  try {
    await HotGamesColor.deleteMany({});

    const created = await HotGamesColor.create({});

    return res.json({
      success: true,
      message: "Hot games color config reset successfully",
      data: created,
      ...created.toObject(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Reset failed",
      error: error?.message,
    });
  }
});

export default router;
