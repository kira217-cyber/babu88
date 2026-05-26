import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import axios from "axios";
import GameHistory from "../models/GameHistory.js";

const router = express.Router();

const ORACLE_GAME_API_BASE =
  process.env.ORACLE_GAME_API_BASE || "https://oraclegames.net/api/game";

const ORACLE_GAME_DATA_KEY =
  process.env.ORACLE_GAME_DATA_KEY || "1189baca156e1bbbecc3b26651a63565";

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
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const buildDateFilter = ({ from, to }) => {
  if (!from && !to) return null;

  const createdAt = {};

  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) {
      createdAt.$gte = fromDate;
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(to))) {
        toDate.setHours(23, 59, 59, 999);
      }

      createdAt.$lte = toDate;
    }
  }

  return Object.keys(createdAt).length ? createdAt : null;
};

const fetchOracleGamesByProviderCode = async (providerCode = "") => {
  const code = String(providerCode || "")
    .trim()
    .toUpperCase();

  if (!code) return new Map();

  try {
    const res = await axios.get(`${ORACLE_GAME_API_BASE}/${code}`, {
      headers: {
        "x-oraclegamedata-key": ORACLE_GAME_DATA_KEY,
      },
      timeout: 30000,
    });

    const games = Array.isArray(res.data?.games)
      ? res.data.games
      : Array.isArray(res.data)
        ? res.data
        : [];

    return new Map(
      games
        .filter((game) => game?.game_uid)
        .map((game) => [
          String(game.game_uid),
          {
            gameName: game.name || "",
            gameUId: game.game_uid || "",
            provider: game.provider || code,
            category: game.category || "",
            original: game.original || "",
            height: game.height || "",
            thumbnail: game.thumbnail || "",
            status: game.status,
          },
        ]),
    );
  } catch (error) {
    console.log(
      "Oracle games fetch failed:",
      error?.response?.data || error.message,
    );

    return new Map();
  }
};

const enrichRows = (rows = [], oracleMap = new Map()) => {
  return rows.map((row) => {
    const oracle = oracleMap.get(String(row.game_uid)) || {};

    return {
      ...row,
      gameName: oracle.gameName || row.game_uid,
      provider: oracle.provider || "",
      category: oracle.category || "",
      oracleImages: {
        thumbnail: oracle.thumbnail || "",
        height: oracle.height || "",
        original: oracle.original || "",
      },
    };
  });
};

router.get("/me/bet-history", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      50,
    );

    const skip = (page - 1) * limit;

    const q = String(req.query.q || "").trim();
    const resultType = String(req.query.resultType || "all")
      .trim()
      .toLowerCase();
    const providerCode = String(req.query.providerCode || "")
      .trim()
      .toUpperCase();
    const from = String(req.query.from || "").trim();
    const to = String(req.query.to || "").trim();

    const match = {
      user: new mongoose.Types.ObjectId(userId),
    };

    if (resultType && resultType !== "all") {
      match.resultType = resultType;
    }

    const createdAt = buildDateFilter({ from, to });
    if (createdAt) {
      match.createdAt = createdAt;
    }

    let oracleMap = new Map();

    if (providerCode) {
      oracleMap = await fetchOracleGamesByProviderCode(providerCode);

      const gameUIds = [...oracleMap.keys()];

      if (!gameUIds.length) {
        match.game_uid = "__NO_MATCH__";
      } else {
        match.game_uid = { $in: gameUIds };
      }
    }

    if (q) {
      const rx = new RegExp(q, "i");

      match.$or = [
        { username: rx },
        { userGamePlayName: rx },
        { member_account: rx },
        { phone: rx },
        { game_uid: rx },
        { game_round: rx },
        { serial_number: rx },
        { resultType: rx },
        { currency: rx },
      ];
    }

    const [rows, total, summaryAgg] = await Promise.all([
      GameHistory.find(match)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      GameHistory.countDocuments(match),

      GameHistory.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalBetAmount: { $sum: { $ifNull: ["$bet_amount", 0] } },
            totalWinAmount: { $sum: { $ifNull: ["$win_amount", 0] } },
            totalNetAmount: { $sum: { $ifNull: ["$net_amount", 0] } },
            totalWinProfit: {
              $sum: {
                $cond: [
                  { $eq: ["$resultType", "win"] },
                  { $ifNull: ["$net_amount", 0] },
                  0,
                ],
              },
            },
            totalLossAmount: {
              $sum: {
                $cond: [
                  { $eq: ["$resultType", "loss"] },
                  { $abs: { $ifNull: ["$net_amount", 0] } },
                  0,
                ],
              },
            },
            winCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "win"] }, 1, 0] },
            },
            lossCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "loss"] }, 1, 0] },
            },
            pushCount: {
              $sum: { $cond: [{ $eq: ["$resultType", "push"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      data: enrichRows(rows, oracleMap),
      filters: {
        q,
        resultType,
        providerCode,
        from,
        to,
      },
      summary: summaryAgg?.[0] || {
        totalBetAmount: 0,
        totalWinAmount: 0,
        totalNetAmount: 0,
        totalWinProfit: 0,
        totalLossAmount: 0,
        winCount: 0,
        lossCount: 0,
        pushCount: 0,
      },
    });
  } catch (e) {
    console.error("bet-history error:", e);

    return res.status(500).json({
      success: false,
      message: "Failed to load bet history",
      error: e.message,
    });
  }
});

export default router;
