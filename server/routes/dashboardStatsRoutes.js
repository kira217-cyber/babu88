// routes/dashboardStatsRoutes.js
import express from "express";
import User from "../models/User.js";
import DepositRequest from "../models/DepositRequests.js";
import WithdrawRequest from "../models/WithdrawRequests.js";

const router = express.Router();

/**
 * ✅ GET /api/admin/dashboard-stats
 * returns:
 *  - allUsers
 *  - allAffiliateUsers
 *  - allDepositBalances (approved deposit sum)
 *  - allWithdrawBalance (approved withdraw sum)
 *  - pendingDepositRequests
 *  - pendingWithdrawRequests
 */
router.get("/admin/dashboard-stats", async (req, res) => {
  try {
    const [
      allUsers,
      allAffiliateUsers,
      pendingDepositRequests,
      pendingWithdrawRequests,
      depositApprovedAgg,
      withdrawApprovedAgg,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "aff-user" }),

      DepositRequest.countDocuments({ status: "pending" }),
      WithdrawRequest.countDocuments({ status: "pending" }),

      // ✅ All Deposit Balances = approved deposit total
      // creditedAmount থাকলে সেটার sum, না হলে amount
      DepositRequest.aggregate([
        { $match: { status: "approved" } },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: ["$calc.creditedAmount", "$amount"],
              },
            },
          },
        },
      ]),

      // ✅ All Withdraw Balance = approved withdraw total
      WithdrawRequest.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const allDepositBalances = depositApprovedAgg?.[0]?.total || 0;
    const allWithdrawBalance = withdrawApprovedAgg?.[0]?.total || 0;

    return res.json({
      success: true,
      data: {
        allUsers,
        allAffiliateUsers,
        allDepositBalances,
        allWithdrawBalance,
        pendingDepositRequests,
        pendingWithdrawRequests,
      },
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Failed", error: e.message });
  }
});

export default router;
