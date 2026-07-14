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
    /* =====================================================
       PAGINATION
    ===================================================== */

    const page = Math.max(
      parseInt(req.query.page || "1", 10),
      1,
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit || "50", 10),
        1,
      ),
      200,
    );

    const skip = (page - 1) * limit;

    /* =====================================================
       BUILD FILTER MATCH
    ===================================================== */

    const {
      match,
      oracleMap,
      filters,
    } = await buildMatch(req);

    /* =====================================================
       DATABASE QUERIES
    ===================================================== */

    const [
      rows,
      totalCount,
      summaryAgg,
      pageSummaryAgg,
    ] = await Promise.all([
      GameHistory.find(match)
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      GameHistory.countDocuments(match),

      GameHistory.aggregate(
        summaryPipeline(match),
      ),

      GameHistory.aggregate(
        pageSummaryPipeline({
          match,
          skip,
          limit,
        }),
      ),
    ]);

    /* =====================================================
       ORACLE ENRICHMENT
    ===================================================== */

    const enrichedRows = enrichRows(
      rows,
      oracleMap,
    );

    /* =====================================================
       NORMALIZE ORACLE + NINE WICKET ROWS
    ===================================================== */

    const data = (
      Array.isArray(enrichedRows)
        ? enrichedRows
        : rows
    ).map((row) => {
      const provider = String(
        row?.provider || "oracle",
      )
        .trim()
        .toLowerCase();

      const isNineWicket =
        provider === "ninewicket";

      const matchStake = Number(
        row?.matchStake || 0,
      );

      const betAmount = Number(
        row?.bet_amount || 0,
      );

      const winAmount = Number(
        row?.win_amount || 0,
      );

      const netAmount = Number(
        row?.net_amount || 0,
      );

      const profitLoss = Number(
        row?.profitLoss || 0,
      );

      const exposureChange = Number(
        row?.exposureChange || 0,
      );

      const exposureAfter = Number(
        row?.exposureAfter || 0,
      );

      const eventTypeName = String(
        row?.eventTypeName || "",
      ).trim();

      const eventName = String(
        row?.eventName || "",
      ).trim();

      const marketName = String(
        row?.marketName || "",
      ).trim();

      const competitionName = String(
        row?.competitionName || "",
      ).trim();

      const nineWicketUsername =
        String(
          row?.nineWicketUsername ||
            "",
        ).trim();

      const displayUsername =
        isNineWicket
          ? nineWicketUsername ||
            row?.member_account ||
            row?.username ||
            ""
          : row?.userGamePlayName ||
            row?.member_account ||
            row?.username ||
            "";

      const displayGameName =
        isNineWicket
          ? eventName ||
            competitionName ||
            "NineWicket"
          : row?.gameName ||
            row?.oracleGameName ||
            row?.displayGameName ||
            row?.game_uid ||
            "";

      const displayProviderName =
        isNineWicket
          ? "NineWicket"
          : row?.providerName ||
            row?.oracleProviderName ||
            row?.providerCode ||
            "Oracle";

      const displayGameSubtitle =
        isNineWicket
          ? [
              eventTypeName,
              competitionName,
              marketName,
            ]
              .filter(Boolean)
              .join(" • ")
          : row?.providerName ||
            row?.providerCode ||
            row?.game_uid ||
            "";

      const displayBetAmount =
        isNineWicket
          ? matchStake || betAmount
          : betAmount;

      return {
        ...row,

        provider,
        isNineWicket,

        bet_amount: betAmount,
        win_amount: winAmount,
        net_amount: netAmount,

        nineWicketUsername,

        nineWicketBetId: String(
          row?.nineWicketBetId || "",
        ).trim(),

        nineWicketBetStatus: String(
          row?.nineWicketBetStatus || "",
        ).trim(),

        matchStake,
        profitLoss,

        eventTypeName,
        eventName,
        marketName,
        competitionName,

        exposureChange,
        exposureAfter,

        displayUsername,
        displayGameName,
        displayProviderName,
        displayGameSubtitle,
        displayBetAmount,
      };
    });

    /* =====================================================
       GLOBAL SUMMARY
    ===================================================== */

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

      totalMatchStake: 0,
      totalNineWicketProfitLoss: 0,
      totalExposureChange: 0,

      oracleCount: 0,
      nineWicketCount: 0,
    };

    /**
     * পুরোনো summaryPipeline-এ NineWicket field না থাকলেও
     * response format consistent থাকবে।
     */
    const normalizedSummary = {
      allBetHistoryCount: Number(
        summary.allBetHistoryCount ||
          totalCount ||
          0,
      ),

      totalBetAmount: Number(
        summary.totalBetAmount || 0,
      ),

      totalWinAmount: Number(
        summary.totalWinAmount || 0,
      ),

      totalNetAmount: Number(
        summary.totalNetAmount || 0,
      ),

      totalWinProfit: Number(
        summary.totalWinProfit || 0,
      ),

      totalLossAmount: Number(
        summary.totalLossAmount || 0,
      ),

      winCount: Number(
        summary.winCount || 0,
      ),

      lossCount: Number(
        summary.lossCount || 0,
      ),

      pushCount: Number(
        summary.pushCount || 0,
      ),

      totalMatchStake: Number(
        summary.totalMatchStake || 0,
      ),

      totalNineWicketProfitLoss:
        Number(
          summary.totalNineWicketProfitLoss ||
            0,
        ),

      totalExposureChange: Number(
        summary.totalExposureChange || 0,
      ),

      oracleCount: Number(
        summary.oracleCount || 0,
      ),

      nineWicketCount: Number(
        summary.nineWicketCount || 0,
      ),
    };

    /* =====================================================
       PAGE SUMMARY
    ===================================================== */

    const pageSummary =
      pageSummaryAgg?.[0] || {
        pageCount: 0,

        pageBetTotal: 0,
        pageWinTotal: 0,
        pageNetTotal: 0,

        pageWinProfit: 0,
        pageLossAmount: 0,

        pageMatchStake: 0,
        pageNineWicketProfitLoss: 0,
        pageExposureChange: 0,
      };

    const normalizedPageSummary = {
      pageCount: Number(
        pageSummary.pageCount ||
          data.length ||
          0,
      ),

      pageBetTotal: Number(
        pageSummary.pageBetTotal || 0,
      ),

      pageWinTotal: Number(
        pageSummary.pageWinTotal || 0,
      ),

      pageNetTotal: Number(
        pageSummary.pageNetTotal || 0,
      ),

      pageWinProfit: Number(
        pageSummary.pageWinProfit || 0,
      ),

      pageLossAmount: Number(
        pageSummary.pageLossAmount || 0,
      ),

      pageMatchStake: Number(
        pageSummary.pageMatchStake || 0,
      ),

      pageNineWicketProfitLoss:
        Number(
          pageSummary.pageNineWicketProfitLoss ||
            0,
        ),

      pageExposureChange: Number(
        pageSummary.pageExposureChange ||
          0,
      ),
    };

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      data,

      pagination: {
        page,
        limit,

        total: totalCount,

        totalPages:
          Math.ceil(
            totalCount / limit,
          ) || 1,

        hasNextPage:
          page * limit <
          totalCount,

        hasPrevPage:
          page > 1,
      },

      filters,

      summary:
        normalizedSummary,

      pageSummary:
        normalizedPageSummary,
    });
  } catch (error) {
    console.error(
      "❌ bet logs fetch error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch all user bet logs",

      error:
        error.message,
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

    /* =====================================================
       USER ID VALIDATION
    ===================================================== */

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const userObjectId =
      new mongoose.Types.ObjectId(id);

    /* =====================================================
       PAGINATION
    ===================================================== */

    const page = Math.max(
      parseInt(req.query.page || "1", 10),
      1,
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit || "20", 10),
        1,
      ),
      200,
    );

    const skip = (page - 1) * limit;

    /* =====================================================
       BUILD FILTER MATCH
    ===================================================== */

    const {
      match,
      oracleMap,
      filters,
    } = await buildMatch(
      req,
      userObjectId,
    );

    /* =====================================================
       DATABASE QUERIES
    ===================================================== */

    const [
      rows,
      totalCount,
      summaryAgg,
      pageSummaryAgg,
    ] = await Promise.all([
      GameHistory.find(match)
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      GameHistory.countDocuments(
        match,
      ),

      GameHistory.aggregate(
        summaryPipeline(match),
      ),

      GameHistory.aggregate(
        pageSummaryPipeline({
          match,
          skip,
          limit,
        }),
      ),
    ]);

    /* =====================================================
       ORACLE GAME ENRICHMENT
    ===================================================== */

    const enrichedRows = enrichRows(
      rows,
      oracleMap,
    );

    /* =====================================================
       NORMALIZE ORACLE + NINE WICKET DATA
    ===================================================== */

    const data = (
      Array.isArray(enrichedRows)
        ? enrichedRows
        : rows
    ).map((row) => {
      const provider = String(
        row?.provider || "oracle",
      )
        .trim()
        .toLowerCase();

      const isNineWicket =
        provider === "ninewicket";

      const betAmount = Number(
        row?.bet_amount || 0,
      );

      const winAmount = Number(
        row?.win_amount || 0,
      );

      const netAmount = Number(
        row?.net_amount || 0,
      );

      const balanceBefore = Number(
        row?.balance_before || 0,
      );

      const balanceAfter = Number(
        row?.balance_after || 0,
      );

      const matchStake = Number(
        row?.matchStake || 0,
      );

      const profitLoss = Number(
        row?.profitLoss || 0,
      );

      const exposureChange = Number(
        row?.exposureChange || 0,
      );

      const exposureAfter = Number(
        row?.exposureAfter || 0,
      );

      const nineWicketUsername =
        String(
          row?.nineWicketUsername || "",
        ).trim();

      const nineWicketBetId =
        String(
          row?.nineWicketBetId || "",
        ).trim();

      const nineWicketBetStatus =
        String(
          row?.nineWicketBetStatus || "",
        ).trim();

      const eventTypeName =
        String(
          row?.eventTypeName || "",
        ).trim();

      const eventName =
        String(
          row?.eventName || "",
        ).trim();

      const marketName =
        String(
          row?.marketName || "",
        ).trim();

      const competitionName =
        String(
          row?.competitionName || "",
        ).trim();

      /* ---------------------------------------------------
         DISPLAY USERNAME
      --------------------------------------------------- */

      const displayUsername =
        isNineWicket
          ? nineWicketUsername ||
            row?.member_account ||
            row?.username ||
            ""
          : row?.userGamePlayName ||
            row?.member_account ||
            row?.username ||
            "";

      /* ---------------------------------------------------
         DISPLAY PROVIDER
      --------------------------------------------------- */

      const displayProviderName =
        isNineWicket
          ? "NineWicket"
          : row?.providerName ||
            row?.oracleProviderName ||
            row?.providerCode ||
            "Oracle";

      /* ---------------------------------------------------
         DISPLAY GAME NAME
      --------------------------------------------------- */

      const displayGameName =
        isNineWicket
          ? eventName ||
            competitionName ||
            "NineWicket"
          : row?.gameName ||
            row?.oracleGameName ||
            row?.displayGameName ||
            row?.game_uid ||
            "";

      /* ---------------------------------------------------
         DISPLAY GAME SUBTITLE
      --------------------------------------------------- */

      const displayGameSubtitle =
        isNineWicket
          ? [
              eventTypeName,
              competitionName,
              marketName,
            ]
              .filter(Boolean)
              .join(" • ")
          : row?.category ||
            row?.providerName ||
            row?.providerCode ||
            row?.game_uid ||
            "";

      /* ---------------------------------------------------
         DISPLAY BET AMOUNT

         NineWicket-এর ক্ষেত্রে matchStake দেখাবে।
         matchStake না থাকলে bet_amount fallback হবে।
      --------------------------------------------------- */

      const displayBetAmount =
        isNineWicket
          ? matchStake || betAmount
          : betAmount;

      return {
        ...row,

        provider,
        isNineWicket,

        bet_amount:
          betAmount,

        win_amount:
          winAmount,

        net_amount:
          netAmount,

        balance_before:
          balanceBefore,

        balance_after:
          balanceAfter,

        nineWicketUsername,

        nineWicketBetId,

        nineWicketBetStatus,

        matchStake,

        profitLoss,

        eventTypeName,

        eventName,

        marketName,

        competitionName,

        exposureChange,

        exposureAfter,

        displayUsername,

        displayProviderName,

        displayGameName,

        displayGameSubtitle,

        displayBetAmount,
      };
    });

    /* =====================================================
       GLOBAL SUMMARY
    ===================================================== */

    const summaryData =
      summaryAgg?.[0] || {
        allBetHistoryCount: 0,

        totalBetAmount: 0,
        totalWinAmount: 0,
        totalNetAmount: 0,

        totalWinProfit: 0,
        totalLossAmount: 0,

        winCount: 0,
        lossCount: 0,
        pushCount: 0,

        totalMatchStake: 0,

        totalNineWicketProfitLoss: 0,

        totalExposureChange: 0,

        oracleCount: 0,

        nineWicketCount: 0,
      };

    const summary = {
      allBetHistoryCount: Number(
        summaryData
          ?.allBetHistoryCount ??
          totalCount ??
          0,
      ),

      totalBetAmount: Number(
        summaryData
          ?.totalBetAmount ?? 0,
      ),

      totalWinAmount: Number(
        summaryData
          ?.totalWinAmount ?? 0,
      ),

      totalNetAmount: Number(
        summaryData
          ?.totalNetAmount ?? 0,
      ),

      totalWinProfit: Number(
        summaryData
          ?.totalWinProfit ?? 0,
      ),

      totalLossAmount: Number(
        summaryData
          ?.totalLossAmount ?? 0,
      ),

      winCount: Number(
        summaryData?.winCount ?? 0,
      ),

      lossCount: Number(
        summaryData?.lossCount ?? 0,
      ),

      pushCount: Number(
        summaryData?.pushCount ?? 0,
      ),

      totalMatchStake: Number(
        summaryData
          ?.totalMatchStake ?? 0,
      ),

      totalNineWicketProfitLoss:
        Number(
          summaryData
            ?.totalNineWicketProfitLoss ??
            0,
        ),

      totalExposureChange: Number(
        summaryData
          ?.totalExposureChange ?? 0,
      ),

      oracleCount: Number(
        summaryData?.oracleCount ?? 0,
      ),

      nineWicketCount: Number(
        summaryData
          ?.nineWicketCount ?? 0,
      ),
    };

    /* =====================================================
       PAGE SUMMARY
    ===================================================== */

    const pageSummaryData =
      pageSummaryAgg?.[0] || {
        pageCount: 0,

        pageBetTotal: 0,
        pageWinTotal: 0,
        pageNetTotal: 0,

        pageWinProfit: 0,
        pageLossAmount: 0,

        pageMatchStake: 0,

        pageNineWicketProfitLoss: 0,

        pageExposureChange: 0,
      };

    const pageSummary = {
      pageCount: Number(
        pageSummaryData
          ?.pageCount ??
          data.length ??
          0,
      ),

      pageBetTotal: Number(
        pageSummaryData
          ?.pageBetTotal ?? 0,
      ),

      pageWinTotal: Number(
        pageSummaryData
          ?.pageWinTotal ?? 0,
      ),

      pageNetTotal: Number(
        pageSummaryData
          ?.pageNetTotal ?? 0,
      ),

      pageWinProfit: Number(
        pageSummaryData
          ?.pageWinProfit ?? 0,
      ),

      pageLossAmount: Number(
        pageSummaryData
          ?.pageLossAmount ?? 0,
      ),

      pageMatchStake: Number(
        pageSummaryData
          ?.pageMatchStake ?? 0,
      ),

      pageNineWicketProfitLoss:
        Number(
          pageSummaryData
            ?.pageNineWicketProfitLoss ??
            0,
        ),

      pageExposureChange: Number(
        pageSummaryData
          ?.pageExposureChange ?? 0,
      ),
    };

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      userId: id,

      data,

      pagination: {
        page,
        limit,

        total:
          totalCount,

        totalPages:
          Math.ceil(
            totalCount / limit,
          ) || 1,

        hasNextPage:
          page * limit <
          totalCount,

        hasPrevPage:
          page > 1,
      },

      filters,

      summary,

      pageSummary,
    });
  } catch (error) {
    console.error(
      "❌ single user bet logs fetch error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch single user bet logs",

      error:
        error.message,
    });
  }
});

export default router;
