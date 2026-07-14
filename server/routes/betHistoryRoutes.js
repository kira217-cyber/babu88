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

    /* =====================================================
       PAGINATION
    ===================================================== */

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);

    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "10", 10), 1),
      50,
    );

    const skip = (page - 1) * limit;

    /* =====================================================
       FILTERS
    ===================================================== */

    const q = String(req.query.q || "").trim();

    const resultType = String(req.query.resultType || "all")
      .trim()
      .toLowerCase();

    /**
     * provider:
     * all | oracle | ninewicket
     */
    const provider = String(req.query.provider || "all")
      .trim()
      .toLowerCase();

    /**
     * Oracle game provider code filter.
     * NineWicket-এর জন্য এটি প্রয়োজন নেই।
     */
    const providerCode = String(req.query.providerCode || "")
      .trim()
      .toUpperCase();

    const from = String(req.query.from || "").trim();

    const to = String(req.query.to || "").trim();

    /* =====================================================
       BASE MATCH
    ===================================================== */

    const match = {
      user: new mongoose.Types.ObjectId(userId),
    };

    /* =====================================================
       RESULT TYPE FILTER
    ===================================================== */

    if (
      resultType &&
      resultType !== "all" &&
      ["win", "loss", "push"].includes(resultType)
    ) {
      match.resultType = resultType;
    }

    /* =====================================================
       CALLBACK PROVIDER FILTER
    ===================================================== */

    if (
      provider &&
      provider !== "all" &&
      ["oracle", "ninewicket"].includes(provider)
    ) {
      match.provider = provider;
    }

    /* =====================================================
       DATE FILTER
    ===================================================== */

    const createdAt = buildDateFilter({
      from,
      to,
    });

    if (createdAt) {
      match.createdAt = createdAt;
    }

    /* =====================================================
       ORACLE GAME PROVIDER FILTER
    ===================================================== */

    let oracleMap = new Map();

    if (providerCode) {
      /**
       * providerCode শুধুমাত্র Oracle games-এর জন্য।
       * তাই providerCode থাকলে automatically Oracle history হবে।
       */
      match.provider = "oracle";

      oracleMap = await fetchOracleGamesByProviderCode(providerCode);

      const gameUIds = [...oracleMap.keys()];

      if (!gameUIds.length) {
        match.game_uid = "__NO_MATCH__";
      } else {
        match.game_uid = {
          $in: gameUIds,
        };
      }
    }

    /* =====================================================
       SEARCH FILTER
    ===================================================== */

    if (q) {
      const rx = new RegExp(q, "i");

      match.$or = [
        { username: rx },

        /**
         * Other Oracle game username
         */
        { userGamePlayName: rx },

        /**
         * NineWicket 6-character username
         */
        { nineWicketUsername: rx },

        { member_account: rx },
        { phone: rx },

        { provider: rx },

        { game_uid: rx },
        { game_round: rx },
        { serial_number: rx },

        { resultType: rx },
        { currency: rx },

        /**
         * NineWicket bet information
         */
        { nineWicketBetId: rx },
        { nineWicketBetStatus: rx },

        /**
         * NineWicket event information
         */
        { eventTypeName: rx },
        { eventName: rx },
        { marketName: rx },
        { competitionName: rx },
      ];
    }

    /* =====================================================
       QUERY + SUMMARY
    ===================================================== */

    const [rows, total, summaryAgg] = await Promise.all([
      GameHistory.find(match)
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      GameHistory.countDocuments(match),

      GameHistory.aggregate([
        {
          $match: match,
        },

        {
          $group: {
            _id: null,

            totalBetAmount: {
              $sum: {
                $ifNull: ["$bet_amount", 0],
              },
            },

            totalWinAmount: {
              $sum: {
                $ifNull: ["$win_amount", 0],
              },
            },

            totalNetAmount: {
              $sum: {
                $ifNull: ["$net_amount", 0],
              },
            },

            /**
             * NineWicket stake total
             */
            totalMatchStake: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$provider", "ninewicket"],
                  },

                  {
                    $ifNull: ["$matchStake", 0],
                  },

                  0,
                ],
              },
            },

            /**
             * NineWicket profit/loss total
             */
            totalNineWicketProfitLoss: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$provider", "ninewicket"],
                  },

                  {
                    $ifNull: ["$profitLoss", 0],
                  },

                  0,
                ],
              },
            },

            totalWinProfit: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$resultType", "win"],
                  },

                  {
                    $ifNull: ["$net_amount", 0],
                  },

                  0,
                ],
              },
            },

            totalLossAmount: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$resultType", "loss"],
                  },

                  {
                    $abs: {
                      $ifNull: ["$net_amount", 0],
                    },
                  },

                  0,
                ],
              },
            },

            totalExposureChange: {
              $sum: {
                $ifNull: ["$exposureChange", 0],
              },
            },

            winCount: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$resultType", "win"],
                  },
                  1,
                  0,
                ],
              },
            },

            lossCount: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$resultType", "loss"],
                  },
                  1,
                  0,
                ],
              },
            },

            pushCount: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$resultType", "push"],
                  },
                  1,
                  0,
                ],
              },
            },

            oracleCount: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$provider", "oracle"],
                  },
                  1,
                  0,
                ],
              },
            },

            nineWicketCount: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$provider", "ninewicket"],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    /* =====================================================
       ENRICH ORACLE ROWS
    ===================================================== */

    const oracleEnrichedRows = enrichRows(rows, oracleMap);

    /**
     * enrichRows যদি নতুন array return করে,
     * NineWicket fields safeভাবে normalize হবে।
     */
    const data = (
      Array.isArray(oracleEnrichedRows) ? oracleEnrichedRows : rows
    ).map((row) => {
      const rowProvider = String(row?.provider || "oracle")
        .trim()
        .toLowerCase();

      const isNineWicket = rowProvider === "ninewicket";

      return {
        ...row,

        provider: rowProvider,

        isNineWicket,

        /**
         * NineWicket username
         */
        nineWicketUsername: row?.nineWicketUsername || "",

        /**
         * NineWicket bet details
         */
        nineWicketBetId: row?.nineWicketBetId || "",

        nineWicketBetStatus: row?.nineWicketBetStatus || "",

        matchStake: Number(row?.matchStake || 0),

        profitLoss: Number(row?.profitLoss || 0),

        /**
         * NineWicket event details
         */
        eventTypeName: row?.eventTypeName || "",

        eventName: row?.eventName || "",

        marketName: row?.marketName || "",

        competitionName: row?.competitionName || "",

        /**
         * Exposure details
         */
        exposureChange: Number(row?.exposureChange || 0),

        exposureAfter: Number(row?.exposureAfter || 0),

        /**
         * Client component-এর জন্য meaningful display values.
         */
        displayUsername: isNineWicket
          ? row?.nineWicketUsername || row?.member_account || ""
          : row?.userGamePlayName || row?.member_account || "",

        displayGameName: isNineWicket
          ? row?.eventName || row?.competitionName || "NineWicket"
          : row?.gameName || row?.oracleGameName || "",

        displayProviderName: isNineWicket
          ? "NineWicket"
          : row?.providerName || row?.providerCode || "Oracle",

        displayBetAmount: isNineWicket
          ? Number(row?.matchStake || row?.bet_amount || 0)
          : Number(row?.bet_amount || 0),
      };
    });

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const summary = summaryAgg?.[0] || {
      totalBetAmount: 0,
      totalWinAmount: 0,
      totalNetAmount: 0,

      totalMatchStake: 0,
      totalNineWicketProfitLoss: 0,

      totalWinProfit: 0,
      totalLossAmount: 0,

      totalExposureChange: 0,

      winCount: 0,
      lossCount: 0,
      pushCount: 0,

      oracleCount: 0,
      nineWicketCount: 0,
    };

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      page,
      limit,
      total,
      totalPages,

      data,

      filters: {
        q,
        resultType,
        provider,
        providerCode,
        from,
        to,
      },

      summary,
    });
  } catch (error) {
    console.error("bet-history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load bet history",
      error: error.message,
    });
  }
});

export default router;
