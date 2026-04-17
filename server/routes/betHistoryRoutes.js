import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import GameHistory from "../models/GameHistory.js";

const router = express.Router();

const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const id =
      decoded?.id ||
      decoded?._id ||
      decoded?.userId ||
      decoded?.user?._id ||
      decoded?.user?.id;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = { id };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

router.get("/me/bet-history", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      50,
    );
    const skip = (page - 1) * limit;

    const { status, bet_type, provider_code, game_code, from, to } = req.query;

    const match = {
      user: new mongoose.Types.ObjectId(userId),
    };

    if (status) match.status = String(status);
    if (bet_type) match.bet_type = String(bet_type);
    if (provider_code)
      match.provider_code = String(provider_code).toUpperCase();
    if (game_code) match.game_code = String(game_code);

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        if (String(to).length <= 10) end.setHours(23, 59, 59, 999);
        match.createdAt.$lte = end;
      }
    }

    const [data, total] = await Promise.all([
      GameHistory.find(match)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GameHistory.countDocuments(match),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      data,
    });
  } catch (e) {
    console.error("bet-history error:", e);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load bet history" });
  }
});

export default router;
