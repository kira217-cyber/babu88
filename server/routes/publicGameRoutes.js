// routes/publicGameRoutes.js
import express from "express";
import GameCategory from "../models/GameCategory.js";
import GameProvider from "../models/GameProvider.js";
import Game from "../models/Game.js";

const router = express.Router();

/**
 * ✅ MENU DATA
 * categories + providers (for MenuItems dropdown)
 */
router.get("/game-menu", async (req, res) => {
  try {
    const categories = await GameCategory.find({ status: "active" })
      // ✅ 1 first, 9 last
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const categoryIds = categories.map((c) => c._id);

    const providers = await GameProvider.find({
      categoryId: { $in: categoryIds },
      status: "active",
    })
      .sort({ createdAt: 1 })
      .lean();

    // group providers by categoryId
    const providerMap = {};
    for (const p of providers) {
      const key = String(p.categoryId);
      if (!providerMap[key]) providerMap[key] = [];
      providerMap[key].push({
        _id: p._id, // providerDbId
        providerName: p.providerName,
        providerId: p.providerId, // oracle provider id
        providerIcon: p.providerIcon,
        providerImage: p.providerImage,
      });
    }

    const menu = categories.map((c) => ({
      _id: c._id,
      categoryName: c.categoryName,
      categoryTitle: c.categoryTitle,
      bannerImage: c.bannerImage,
      iconImage: c.iconImage,
      order: c.order, // ✅ NEW: send order
      providers: providerMap[String(c._id)] || [],
    }));

    res.json({ success: true, data: menu });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

/**
 * ✅ SINGLE CATEGORY (GameCategory page)
 */
router.get("/game-categories/:id", async (req, res) => {
  try {
    const category = await GameCategory.findById(req.params.id).lean();
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const providers = await GameProvider.find({
      categoryId: category._id,
      status: "active",
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: {
        ...category,
        providers: providers.map((p) => ({
          _id: p._id,
          providerName: p.providerName,
          providerId: p.providerId,
          providerIcon: p.providerIcon,
          providerImage: p.providerImage,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

// ✅ Providers list by categoryId
router.get("/game-categories/:id/providers", async (req, res) => {
  try {
    const categoryId = req.params.id;

    // category exists check (optional but good)
    const category = await GameCategory.findById(categoryId)
      .select("_id")
      .lean();
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const providers = await GameProvider.find({
      categoryId,
      status: "active",
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: providers.map((p) => ({
        _id: p._id, // providerDbId
        providerName: p.providerName,
        providerId: p.providerId, // oracle provider id
        providerIcon: p.providerIcon,
        providerImage: p.providerImage,
      })),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

/**
 * ✅ GAMES LIST (saved games)
 */
router.get("/games", async (req, res) => {
  try {
    const { categoryId, providerDbId } = req.query;
    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "categoryId required" });
    }

    const filter = { categoryId };
    if (providerDbId) filter.providerDbId = providerDbId;

    const games = await Game.find(filter).sort({ createdAt: -1 }).lean();

    res.json({ success: true, data: games });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

// ✅ Hot games (last N)
router.get("/hot-games", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "15", 10), 50);

    const games = await Game.find({ isHot: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, data: games });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err?.message || "Server error",
    });
  }
});

// ✅ active categories list (with iconImage + name)
router.get("/game-categories", async (req, res) => {
  try {
    const list = await GameCategory.find({ status: "active" })
      .sort({ createdAt: -1 })
      .select("categoryName iconImage status createdAt order")
      .lean();

    res.json({ success: true, data: list });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err?.message || "Server error" });
  }
});

// ✅ games by category (all games under that category)
router.get("/all-games", async (req, res) => {
  try {
    const { categoryId } = req.query;
    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "categoryId is required" });
    }

    const games = await Game.find({ categoryId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: games });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err?.message || "Server error" });
  }
});

export default router;
