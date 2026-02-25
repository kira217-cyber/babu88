// routes/callback.route.js
import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";

const router = express.Router();

/**
 * ✅ Apply wager amount to running turnover(s)
 * - adds progress to oldest running turnovers first
 * - marks completed when progress reaches required
 * - uses TurnOver schema: { user, sourceType, sourceId, required, progress, status, completedAt }
 */
const applyTurnoverProgress = async ({ session, userId, wagerAmount }) => {
  const amt = Number(wagerAmount || 0);
  if (!Number.isFinite(amt) || amt <= 0) return;

  const running = await TurnOver.find({
    user: userId,
    status: "running",
  })
    .sort({ createdAt: 1 }) // oldest first
    .session(session);

  if (!running.length) return;

  let remaining = amt;

  for (const t of running) {
    if (remaining <= 0) break;

    const required = Number(t.required || 0);
    const progress = Number(t.progress || 0);

    const left = Math.max(0, required - progress);
    if (left <= 0) {
      // safety: if somehow progress already reached required but status not updated
      await TurnOver.updateOne(
        { _id: t._id },
        { $set: { status: "completed", completedAt: new Date() } },
      ).session(session);
      continue;
    }

    const add = Math.min(left, remaining);
    const newProgress = progress + add;
    const completed = newProgress >= required;

    await TurnOver.updateOne(
      { _id: t._id },
      {
        $inc: { progress: add },
        ...(completed
          ? { $set: { status: "completed", completedAt: new Date() } }
          : {}),
      },
    ).session(session);

    remaining -= add;
  }
};

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

    // ✅ Balance change based on bet_type (KEEP ORIGINAL LOGIC)
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
          throw Object.assign(new Error("DUPLICATE_TX"), {
            statusCode: 200,
            duplicate: true,
            currentBalance: player.balance || 0,
          });
        }
      }

      const currentBalance = Number(player.balance || 0);
      const newBalance = currentBalance + balanceChange;

      // ✅ Game history record (KEEP SAME STRUCTURE)
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
      // ✅ Turnover progress logic (BASED ON TurnOver schema)
      // Rule: user game khelle turnover puron hobe -> wager amount add হবে
      // ✅ Common practice: only BET counts as turnover (wagered amount)
      // If you WANT settle to count too, just add "|| bet_type === 'SETTLE'"
      // =========================================================
      if (bet_type === "BET" && amountFloat > 0) {
        await applyTurnoverProgress({
          session,
          userId: player._id,
          wagerAmount: amountFloat,
        });
      }

      // =========================================================
      // ✅ Affiliate commission logic (KEEP SAME)
      // =========================================================
      let affiliateInfo = null;

      if (player.referredBy) {
        const affiliator = await User.findById(player.referredBy).session(
          session,
        );

        if (
          affiliator &&
          affiliator.role === "aff-user" &&
          affiliator.isActive
        ) {
          const lossPct = Number(affiliator.gameLossCommission || 0);
          const winPct = Number(affiliator.gameWinCommission || 0);

          let commissionAmount = 0;
          let commissionField = null;

          if (bet_type === "BET" && lossPct > 0) {
            commissionAmount = (amountFloat * lossPct) / 100;
            commissionField = "gameLossCommissionBalance";
          }

          if (bet_type === "SETTLE" && winPct > 0) {
            commissionAmount = (amountFloat * winPct) / 100;
            commissionField = "gameWinCommissionBalance";
          }

          if (commissionAmount > 0 && commissionField) {
            await User.updateOne(
              { _id: affiliator._id },
              { $inc: { [commissionField]: commissionAmount } },
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

      res.locals.__result = {
        playerUsername: player.username,
        newBalance,
        change: balanceChange,
        transaction_id: transaction_id || null,
        affiliateInfo,
      };
    });

    return res.json({
      success: true,
      message: "Processed successfully",
      data: res.locals.__result,
    });
  } catch (err) {
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
