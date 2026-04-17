// routes/refund.route.js
import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

/**
 * ✅ Refund Callback
 * POST /api/refund
 *
 * Expected body:
 * {
 *  account_id, username, provider_code, amount, game_code,
 *  verification_key, bet_type, transaction_id, times
 * }
 *

/**
 * ✅ Logic:
 * - only process bet_type === "REFUND" (optional strict)
 * - add +amount to user balance
 * - push refund record to user.refundHistory
 * - idempotency: if transaction_id already exists in refundHistory -> skip
 */
router.post("/", async (req, res) => {
  try {
    const {
      account_id,
      username: rawUsername,
      provider_code,
      amount,
      game_code,
      verification_key,
      bet_type,
      transaction_id,
      times,
    } = req.body;

    console.log("Refund callback received:", {
      account_id,
      rawUsername,
      provider_code,
      amount,
      game_code,
      bet_type,
      transaction_id,
    });

    // ✅ Basic validation
    if (
      !rawUsername ||
      !provider_code ||
      amount === undefined ||
      !game_code
      // bet_type optional: some providers might not send "REFUND" always
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ✅ (Optional) strict check (enable if you want)
    // if (String(bet_type || "").toUpperCase() !== "REFUND") {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Invalid bet_type for refund endpoint. Expected "REFUND", got "${bet_type}"`,
    //   });
    // }

    // ✅ Clean username (same as your callback route)
    let cleanUsername = String(rawUsername).trim();
    if (cleanUsername.endsWith("45")) {
      cleanUsername = cleanUsername.slice(0, -2);
    }

    const amountFloat = Number.parseFloat(amount);
    if (!Number.isFinite(amountFloat) || amountFloat <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or non-positive amount",
      });
    }

    // ✅ Find user
    const player = await User.findOne({ username: cleanUsername });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Optional: block inactive users
    if (player.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "User is inactive",
      });
    }

    // ✅ Idempotency: if same transaction_id already refunded, skip
    if (transaction_id) {
      const already = await User.findOne({
        _id: player._id,
        "refundHistory.transaction_id": transaction_id,
      });

      if (already) {
        return res.json({
          success: true,
          message: "Already processed (duplicate refund transaction_id)",
          data: {
            transaction_id: req.body?.transaction_id || null,
            current_balance: Number(player.balance || 0),
          },
        });
      }
    }

    const currentBalance = Number(player.balance || 0);
    const newBalance = currentBalance + amountFloat;

    const refundRecord = {
      provider_code,
      game_code,
      bet_type: "REFUND",
      amount: amountFloat,
      transaction_id: transaction_id || null,
      verification_key: verification_key || null,
      times: times || null,
      status: "refunded",
      balance_after: newBalance,
      refundedAt: new Date(),
    };

    // ✅ extra re-check to reduce duplicate/race condition
    if (transaction_id) {
      const duplicateAgain = await User.findOne({
        _id: player._id,
        "refundHistory.transaction_id": transaction_id,
      });

      if (duplicateAgain) {
        return res.json({
          success: true,
          message: "Already processed (duplicate refund transaction_id)",
          data: {
            transaction_id: req.body?.transaction_id || null,
            current_balance: Number(player.balance || 0),
          },
        });
      }
    }

    // ✅ Update balance + push refundHistory
    player.balance = newBalance;
    if (!Array.isArray(player.refundHistory)) {
      player.refundHistory = [];
    }
    player.refundHistory.push(refundRecord);
    await player.save();

    const result = {
      playerUsername: player.username,
      newBalance,
      refundAmount: amountFloat,
      transaction_id: transaction_id || null,
    };

    return res.json({
      success: true,
      message: "Refund processed successfully",
      data: result,
    });
  } catch (err) {
    console.error("Refund callback error:", err);

    const status = err?.statusCode || 500;

    return res.status(status).json({
      success: false,
      message:
        status === 404 ? "User not found" : err.message || "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;