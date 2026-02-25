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
 * ✅ Logic:
 * - only process bet_type === "REFUND" (optional strict)
 * - add +amount to user balance
 * - push refund record to user.refundHistory
 * - idempotency: if transaction_id already exists in refundHistory -> skip
 */
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();

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

    await session.withTransaction(async () => {
      // ✅ Find user
      const player = await User.findOne({ username: cleanUsername }).session(
        session,
      );

      if (!player) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
      }

      // ✅ Optional: block inactive users
      if (player.isActive === false) {
        throw Object.assign(new Error("User is inactive"), { statusCode: 403 });
      }

      // ✅ Idempotency: if same transaction_id already refunded, skip
      if (transaction_id) {
        const already = await User.findOne({
          _id: player._id,
          "refundHistory.transaction_id": transaction_id,
        }).session(session);

        if (already) {
          // return "success true" but no double-credit
          throw Object.assign(new Error("DUPLICATE_REFUND_TX"), {
            statusCode: 200,
            duplicate: true,
            currentBalance: player.balance || 0,
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

      // ✅ Update balance + push refundHistory
      await User.updateOne(
        { _id: player._id },
        {
          $set: { balance: newBalance },
          $push: { refundHistory: refundRecord },
        },
      ).session(session);

      res.locals.__result = {
        playerUsername: player.username,
        newBalance,
        refundAmount: amountFloat,
        transaction_id: transaction_id || null,
      };
    });

    return res.json({
      success: true,
      message: "Refund processed successfully",
      data: res.locals.__result,
    });
  } catch (err) {
    // ✅ Duplicate safe response
    if (err?.message === "DUPLICATE_REFUND_TX" && err?.duplicate) {
      return res.json({
        success: true,
        message: "Already processed (duplicate refund transaction_id)",
        data: {
          transaction_id: req.body?.transaction_id || null,
          current_balance: err.currentBalance,
        },
      });
    }

    const status = err?.statusCode || 500;

    console.error("Refund callback error:", err);

    return res.status(status).json({
      success: false,
      message:
        status === 404 ? "User not found" : err.message || "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    session.endSession();
  }
});

export default router;