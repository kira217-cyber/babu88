import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import jwt from "jsonwebtoken";



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

    // ✅ adjust according to your token payload
    // common payloads: { id }, { _id }, { userId }, { user: { _id } }
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

/**
 * GET /api/me/bet-history
 * Query:
 *  - page=1
 *  - limit=10
 *  - status=won|lost|settled|pending...
 *  - bet_type=BET|SETTLE|CANCEL|REFUND|BONUS|PROMO
 *  - provider_code=XXX
 *  - game_code=YYY
 *  - from=2026-02-01 (ISO date)
 *  - to=2026-02-21 (ISO date)
 */

router.get("/me/bet-history", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const skip = (page - 1) * limit;

    const {
      status,
      bet_type,
      provider_code,
      game_code,
      from,
      to,
    } = req.query;

    // ---- Build match for history items ----
    const itemMatch = {};

    if (status) itemMatch["gameHistory.status"] = String(status);
    if (bet_type) itemMatch["gameHistory.bet_type"] = String(bet_type);
    if (provider_code)
      itemMatch["gameHistory.provider_code"] = String(provider_code).toUpperCase();
    if (game_code) itemMatch["gameHistory.game_code"] = String(game_code);

    // date range
    if (from || to) {
      itemMatch["gameHistory.createdAt"] = {};
      if (from) itemMatch["gameHistory.createdAt"].$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        // include whole day if date-only string
        if (String(to).length <= 10) end.setHours(23, 59, 59, 999);
        itemMatch["gameHistory.createdAt"].$lte = end;
      }
    }

    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$gameHistory" },

      // apply filters on unwound gameHistory
      Object.keys(itemMatch).length ? { $match: itemMatch } : null,

      { $sort: { "gameHistory.createdAt": -1 } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                item: "$gameHistory",
              },
            },
          ],
          meta: [{ $count: "total" }],
        },
      },
    ].filter(Boolean);

    const agg = await User.aggregate(pipeline);

    const data = agg?.[0]?.data?.map((x) => x.item) || [];
    const total = agg?.[0]?.meta?.[0]?.total || 0;
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
    return res.status(500).json({ success: false, message: "Failed to load bet history" });
  }
});

export default router;