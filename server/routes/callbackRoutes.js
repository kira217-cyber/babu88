// routes/callback.route.js
import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

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

    console.log("Callback received:", req.body);

    // ✅ Basic validation
    if (
      !rawUsername ||
      !provider_code ||
      amount === undefined ||
      !game_code ||
      !bet_type
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // ✅ Clean username (remove trailing "45" if present)
    let cleanUsername = String(rawUsername).trim();
    if (cleanUsername.endsWith("45")) {
      cleanUsername = cleanUsername.slice(0, -2);
    }

    const amountFloat = Number.parseFloat(amount);
    if (!Number.isFinite(amountFloat) || amountFloat < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    // ✅ Balance change based on bet_type
    let balanceChange = 0;
    if (bet_type === "BET") {
      balanceChange = -amountFloat;
    } else if (bet_type === "SETTLE") {
      balanceChange = +amountFloat;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid bet_type" });
    }

    await session.withTransaction(async () => {
      // ✅ Find player
      const player = await User.findOne({ username: cleanUsername }).session(
        session,
      );

      if (!player) {
        console.log("User not found:", cleanUsername);
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
      }

      // ✅ Optional: block inactive users
      if (player.isActive === false) {
        throw Object.assign(new Error("User is inactive"), { statusCode: 403 });
      }

      // ✅ Idempotency: if transaction_id already exists, skip processing
      if (transaction_id) {
        const already = await User.findOne({
          _id: player._id,
          "gameHistory.transaction_id": transaction_id,
        }).session(session);

        if (already) {
          // Already processed, return current balance
          throw Object.assign(new Error("DUPLICATE_TX"), {
            statusCode: 200,
            duplicate: true,
            currentBalance: player.balance || 0,
          });
        }
      }

      const currentBalance = Number(player.balance || 0);
      const newBalance = currentBalance + balanceChange;

      // ✅ Game history record
      const gameRecord = {
        provider_code,
        game_code,
        bet_type,
        amount: amountFloat,
        transaction_id: transaction_id || null,
        verification_key: verification_key || null,
        times: times || null,
        status: bet_type === "BET" ? "bet" : "settled",
        win_amount: bet_type === "SETTLE" ? amountFloat : 0,
        balance_after: newBalance,
        bet_details: {},
      };

      // ✅ Update player balance + history
      await User.updateOne(
        { _id: player._id },
        {
          $set: { balance: newBalance },
          $push: { gameHistory: gameRecord },
        },
      ).session(session);

      // =========================================================
      // ✅ Affiliate commission logic (only if referredBy exists)
      // =========================================================
      let affiliateInfo = null;

      if (player.referredBy) {
        const affiliator = await User.findById(player.referredBy).session(
          session,
        );

        // only apply if valid aff-user & active
        if (
          affiliator &&
          affiliator.role === "aff-user" &&
          affiliator.isActive
        ) {
          const lossPct = Number(affiliator.gameLossCommission || 0); // percent
          const winPct = Number(affiliator.gameWinCommission || 0); // percent

          let commissionAmount = 0;
          let commissionField = null;

          // তোমার requirement অনুযায়ী:
          // BET = user lost (loss commission)
          // SETTLE = user won (win commission)
          if (bet_type === "BET" && lossPct > 0) {
            commissionAmount = (amountFloat * lossPct) / 100;
            commissionField = "gameLossCommissionBalance";
          }

          if (bet_type === "SETTLE" && winPct > 0) {
            commissionAmount = (amountFloat * winPct) / 100;
            commissionField = "gameWinCommissionBalance";
          }

          // Only update if commission > 0
          if (commissionAmount > 0 && commissionField) {
            await User.updateOne(
              { _id: affiliator._id },
              {
                $inc: { [commissionField]: commissionAmount },
              },
            ).session(session);

            affiliateInfo = {
              affiliatorId: String(affiliator._id),
              affiliatorUsername: affiliator.username,
              bet_type,
              commissionPercent: bet_type === "BET" ? lossPct : winPct,
              commissionAmount,
              walletField: commissionField,
            };
          }
        }
      }

      // attach on session object via closure return
      res.locals.__result = {
        playerUsername: player.username,
        newBalance,
        change: balanceChange,
        transaction_id: transaction_id || null,
        affiliateInfo,
      };
    });

    // ✅ success response
    return res.json({
      success: true,
      message: "Processed successfully",
      data: res.locals.__result,
    });
  } catch (err) {
    // ✅ Duplicate TX special return
    if (err?.message === "DUPLICATE_TX" && err?.duplicate) {
      return res.json({
        success: true,
        message: "Already processed (duplicate transaction_id)",
        data: {
          transaction_id: req.body?.transaction_id || null,
          current_balance: err.currentBalance,
        },
      });
    }

    const status = err?.statusCode || 500;

    console.error("Callback error:", err);

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
