import express from "express";
import mongoose from "mongoose";
import GameHistory from "../models/GameHistory.js";

const router = express.Router();

router.get("/admin/bet-logs", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "50", 10), 1),
      200,
    );
    const skip = (page - 1) * limit;

    const q = String(req.query.q || "").trim();
    const betType = String(req.query.betType || "all")
      .trim()
      .toUpperCase();
    const status = String(req.query.status || "all")
      .trim()
      .toLowerCase();
    const from = String(req.query.from || "").trim();
    const to = String(req.query.to || "").trim();

    const match = {};

    if (betType && betType !== "ALL") match.bet_type = betType;
    if (status && status !== "all") match.status = status;

    if (from || to) {
      match.createdAt = {};

      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) match.createdAt.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
            toDate.setHours(23, 59, 59, 999);
          }
          match.createdAt.$lte = toDate;
        }
      }

      if (Object.keys(match.createdAt).length === 0) {
        delete match.createdAt;
      }
    }

    if (q) {
      const rx = new RegExp(q, "i");
      match.$or = [
        { username: rx },
        { phone: rx },
        { provider_code: rx },
        { game_code: rx },
        { transaction_id: rx },
        { round_id: rx },
        { verification_key: rx },
        { bet_type: rx },
        { status: rx },
      ];
    }

    const [rows, totalCount, summaryAgg, pageSummaryAgg] = await Promise.all([
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
            allBetHistoryCount: { $sum: 1 },

            betLossTotalAmount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "lost"] },
                      {
                        $and: [
                          { $eq: ["$bet_type", "BET"] },
                          { $lte: [{ $ifNull: ["$win_amount", 0] }, 0] },
                          { $in: ["$status", ["settled", "lost", "bet"]] },
                        ],
                      },
                    ],
                  },
                  { $ifNull: ["$amount", 0] },
                  0,
                ],
              },
            },

            betWinTotalAmount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "won"] },
                      { $gt: [{ $ifNull: ["$win_amount", 0] }, 0] },
                    ],
                  },
                  {
                    $cond: [
                      { $gt: [{ $ifNull: ["$win_amount", 0] }, 0] },
                      { $ifNull: ["$win_amount", 0] },
                      { $ifNull: ["$amount", 0] },
                    ],
                  },
                  0,
                ],
              },
            },

            refundAmount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "refunded"] },
                      { $eq: ["$bet_type", "REFUND"] },
                    ],
                  },
                  { $ifNull: ["$amount", 0] },
                  0,
                ],
              },
            },
          },
        },
      ]),
      GameHistory.aggregate([
        { $match: match },
        { $sort: { createdAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $group: {
            _id: null,
            pageCount: { $sum: 1 },
            pageAmountTotal: { $sum: { $ifNull: ["$amount", 0] } },
            pageWinTotal: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "won"] },
                      { $gt: [{ $ifNull: ["$win_amount", 0] }, 0] },
                    ],
                  },
                  {
                    $cond: [
                      { $gt: [{ $ifNull: ["$win_amount", 0] }, 0] },
                      { $ifNull: ["$win_amount", 0] },
                      0,
                    ],
                  },
                  0,
                ],
              },
            },
            pageRefundTotal: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "refunded"] },
                      { $eq: ["$bet_type", "REFUND"] },
                    ],
                  },
                  { $ifNull: ["$amount", 0] },
                  0,
                ],
              },
            },
            pageLossTotal: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "lost"] },
                      {
                        $and: [
                          { $eq: ["$bet_type", "BET"] },
                          { $lte: [{ $ifNull: ["$win_amount", 0] }, 0] },
                          { $in: ["$status", ["settled", "lost", "bet"]] },
                        ],
                      },
                    ],
                  },
                  { $ifNull: ["$amount", 0] },
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const summary = summaryAgg?.[0] || {
      allBetHistoryCount: 0,
      betLossTotalAmount: 0,
      betWinTotalAmount: 0,
      refundAmount: 0,
    };

    const pageSummary = pageSummaryAgg?.[0] || {
      pageCount: 0,
      pageAmountTotal: 0,
      pageWinTotal: 0,
      pageRefundTotal: 0,
      pageLossTotal: 0,
    };

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
      filters: {
        q,
        betType: betType || "all",
        status: status || "all",
        from,
        to,
      },
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

    const q = String(req.query.q || "").trim();
    const betType = String(req.query.betType || "all")
      .trim()
      .toUpperCase();
    const status = String(req.query.status || "all")
      .trim()
      .toLowerCase();
    const from = String(req.query.from || "").trim();
    const to = String(req.query.to || "").trim();

    const match = { user: userObjectId };

    if (betType && betType !== "ALL") match.bet_type = betType;
    if (status && status !== "all") match.status = status;

    if (from || to) {
      match.createdAt = {};

      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) match.createdAt.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
            toDate.setHours(23, 59, 59, 999);
          }
          match.createdAt.$lte = toDate;
        }
      }

      if (Object.keys(match.createdAt).length === 0) {
        delete match.createdAt;
      }
    }

    if (q) {
      const rx = new RegExp(q, "i");
      match.$or = [
        { username: rx },
        { phone: rx },
        { provider_code: rx },
        { game_code: rx },
        { transaction_id: rx },
        { round_id: rx },
        { verification_key: rx },
        { bet_type: rx },
        { status: rx },
      ];
    }

    const [rows, totalCount, summaryAgg, pageSummaryAgg] = await Promise.all([
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
            allBetHistoryCount: { $sum: 1 },
            betLossTotalAmount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "lost"] },
                      {
                        $and: [
                          { $eq: ["$bet_type", "BET"] },
                          { $lte: [{ $ifNull: ["$win_amount", 0] }, 0] },
                          { $in: ["$status", ["settled", "lost", "bet"]] },
                        ],
                      },
                    ],
                  },
                  { $ifNull: ["$amount", 0] },
                  0,
                ],
              },
            },
            betWinTotalAmount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "won"] },
                      { $gt: [{ $ifNull: ["$win_amount", 0] }, 0] },
                    ],
                  },
                  {
                    $cond: [
                      { $gt: [{ $ifNull: ["$win_amount", 0] }, 0] },
                      { $ifNull: ["$win_amount", 0] },
                      { $ifNull: ["$amount", 0] },
                    ],
                  },
                  0,
                ],
              },
            },
            refundAmount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "refunded"] },
                      { $eq: ["$bet_type", "REFUND"] },
                    ],
                  },
                  { $ifNull: ["$amount", 0] },
                  0,
                ],
              },
            },
          },
        },
      ]),
      GameHistory.aggregate([
        { $match: match },
        { $sort: { createdAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $group: {
            _id: null,
            pageCount: { $sum: 1 },
            pageAmountTotal: { $sum: { $ifNull: ["$amount", 0] } },
            pageWinTotal: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "won"] },
                      { $gt: [{ $ifNull: ["$win_amount", 0] }, 0] },
                    ],
                  },
                  {
                    $cond: [
                      { $gt: [{ $ifNull: ["$win_amount", 0] }, 0] },
                      { $ifNull: ["$win_amount", 0] },
                      0,
                    ],
                  },
                  0,
                ],
              },
            },
            pageRefundTotal: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "refunded"] },
                      { $eq: ["$bet_type", "REFUND"] },
                    ],
                  },
                  { $ifNull: ["$amount", 0] },
                  0,
                ],
              },
            },
            pageLossTotal: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$status", "lost"] },
                      {
                        $and: [
                          { $eq: ["$bet_type", "BET"] },
                          { $lte: [{ $ifNull: ["$win_amount", 0] }, 0] },
                          { $in: ["$status", ["settled", "lost", "bet"]] },
                        ],
                      },
                    ],
                  },
                  { $ifNull: ["$amount", 0] },
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const summary = summaryAgg?.[0] || {
      allBetHistoryCount: 0,
      betLossTotalAmount: 0,
      betWinTotalAmount: 0,
      refundAmount: 0,
    };

    const pageSummary = pageSummaryAgg?.[0] || {
      pageCount: 0,
      pageAmountTotal: 0,
      pageWinTotal: 0,
      pageRefundTotal: 0,
      pageLossTotal: 0,
    };

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      },
      filters: {
        q,
        betType: betType || "all",
        status: status || "all",
        from,
        to,
      },
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
