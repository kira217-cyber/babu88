import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import GameHistory from "../models/GameHistory.js";

const router = express.Router();

const ORACLE_GAME_API_BASE =
  process.env.ORACLE_GAME_API_BASE || "https://oraclegames.net/api/game";

const ORACLE_GAME_DATA_KEY =
  process.env.ORACLE_GAME_DATA_KEY || "1189baca156e1bbbecc3b26651a63565";

const toNum = (v = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const money = (v = 0) => {
  return Math.trunc(toNum(v) * 100) / 100;
};

const buildDateFilter = ({ from, to }) => {
  if (!from && !to) return null;

  const createdAt = {};

  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) createdAt.$gte = fromDate;
  }

  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
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

    const games = Array.isArray(res.data?.games) ? res.data.games : [];

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
      "Oracle provider games fetch failed:",
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

const buildMatch = async (req, userObjectId = null) => {
  const q = String(req.query.q || "").trim();
  const resultType = String(req.query.resultType || "all")
    .trim()
    .toLowerCase();
  const providerCode = String(req.query.providerCode || "")
    .trim()
    .toUpperCase();
  const from = String(req.query.from || "").trim();
  const to = String(req.query.to || "").trim();

  const match = {};

  if (userObjectId) match.user = userObjectId;

  if (resultType && resultType !== "all") {
    match.resultType = resultType;
  }

  const createdAt = buildDateFilter({ from, to });
  if (createdAt) match.createdAt = createdAt;

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

  return {
    match,
    oracleMap,
    filters: {
      q,
      resultType: resultType || "all",
      providerCode,
      from,
      to,
    },
  };
};

const summaryPipeline = (match) => [
  { $match: match },
  {
    $group: {
      _id: null,
      allBetHistoryCount: { $sum: 1 },

      totalBetAmount: {
        $sum: { $ifNull: ["$bet_amount", 0] },
      },

      totalWinAmount: {
        $sum: { $ifNull: ["$win_amount", 0] },
      },

      totalNetAmount: {
        $sum: { $ifNull: ["$net_amount", 0] },
      },

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
];

const pageSummaryPipeline = ({ match, skip, limit }) => [
  { $match: match },
  { $sort: { createdAt: -1, _id: -1 } },
  { $skip: skip },
  { $limit: limit },
  {
    $group: {
      _id: null,
      pageCount: { $sum: 1 },
      pageBetTotal: { $sum: { $ifNull: ["$bet_amount", 0] } },
      pageWinTotal: { $sum: { $ifNull: ["$win_amount", 0] } },
      pageNetTotal: { $sum: { $ifNull: ["$net_amount", 0] } },

      pageWinProfit: {
        $sum: {
          $cond: [
            { $eq: ["$resultType", "win"] },
            { $ifNull: ["$net_amount", 0] },
            0,
          ],
        },
      },

      pageLossAmount: {
        $sum: {
          $cond: [
            { $eq: ["$resultType", "loss"] },
            { $abs: { $ifNull: ["$net_amount", 0] } },
            0,
          ],
        },
      },
    },
  },
];

/* ======================================================
   ALL USER BET LOGS
   GET /api/admin/bet-logs
====================================================== */

router.get("/admin/bet-logs", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "50", 10), 1),
      200,
    );
    const skip = (page - 1) * limit;

    const { match, oracleMap, filters } = await buildMatch(req);

    const [rows, totalCount, summaryAgg, pageSummaryAgg] = await Promise.all([
      GameHistory.find(match)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      GameHistory.countDocuments(match),

      GameHistory.aggregate(summaryPipeline(match)),

      GameHistory.aggregate(pageSummaryPipeline({ match, skip, limit })),
    ]);

    const summary = summaryAgg?.[0] || {
      allBetHistoryCount: 0,
      totalBetAmount: 0,
      totalWinAmount: 0,
      totalNetAmount: 0,
      totalWinProfit: 0,
      totalLossAmount: 0,
      winCount: 0,
      lossCount: 0,
      pushCount: 0,
    };

    const pageSummary = pageSummaryAgg?.[0] || {
      pageCount: 0,
      pageBetTotal: 0,
      pageWinTotal: 0,
      pageNetTotal: 0,
      pageWinProfit: 0,
      pageLossAmount: 0,
    };

    return res.status(200).json({
      success: true,
      data: enrichRows(rows, oracleMap),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
      filters,
      summary,
      pageSummary,
    });
  } catch (error) {
    console.error("❌ bet logs fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all user bet logs",
      error: error.message,
    });
  }
});

/* ======================================================
   SINGLE USER BET LOGS
   GET /api/admin/users/:id/bet-logs
====================================================== */

router.get("/admin/users/:id/bet-logs", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(id);

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "20", 10), 1),
      200,
    );
    const skip = (page - 1) * limit;

    const { match, oracleMap, filters } = await buildMatch(req, userObjectId);

    const [rows, totalCount, summaryAgg, pageSummaryAgg] = await Promise.all([
      GameHistory.find(match)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      GameHistory.countDocuments(match),

      GameHistory.aggregate(summaryPipeline(match)),

      GameHistory.aggregate(pageSummaryPipeline({ match, skip, limit })),
    ]);

    const summary = summaryAgg?.[0] || {
      allBetHistoryCount: 0,
      totalBetAmount: 0,
      totalWinAmount: 0,
      totalNetAmount: 0,
      totalWinProfit: 0,
      totalLossAmount: 0,
      winCount: 0,
      lossCount: 0,
      pushCount: 0,
    };

    const pageSummary = pageSummaryAgg?.[0] || {
      pageCount: 0,
      pageBetTotal: 0,
      pageWinTotal: 0,
      pageNetTotal: 0,
      pageWinProfit: 0,
      pageLossAmount: 0,
    };

    return res.status(200).json({
      success: true,
      data: enrichRows(rows, oracleMap),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
      filters,
      summary,
      pageSummary,
    });
  } catch (error) {
    console.error("❌ single user bet logs fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch single user bet logs",
      error: error.message,
    });
  }
});

export default router;
