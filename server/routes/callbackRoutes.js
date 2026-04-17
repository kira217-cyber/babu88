// routes/callback.route.js
import express from "express";
import User from "../models/User.js";
import TurnOver from "../models/TurnOver.js";
import GameHistory from "../models/GameHistory.js";

const router = express.Router();

/**
 * Apply wager amount to running turnover(s)
 * - adds progress to oldest running turnovers first
 * - marks completed when progress reaches required
 * - no transaction/session used
 */
const applyTurnoverProgress = async ({ userId, wagerAmount }) => {
  const amt = Number(wagerAmount || 0);
  if (!Number.isFinite(amt) || amt <= 0) return;

  const running = await TurnOver.find({
    user: userId,
    status: "running",
  }).sort({ createdAt: 1 });

  if (!running.length) return;

  let remaining = amt;

  for (const t of running) {
    if (remaining <= 0) break;

    const required = Number(t.required || 0);
    const progress = Number(t.progress || 0);
    const left = Math.max(0, required - progress);

    if (left <= 0) {
      await TurnOver.updateOne(
        { _id: t._id },
        { $set: { status: "completed", completedAt: new Date() } },
      );
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
    );

    remaining -= add;
  }
};

router.post("/", async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      username: rawUsername,
      provider_code,
      amount,
      game_code,
      transaction_id,
      bet_type,
      verification_key,
      round_id,
      times,
      bet_details,
    } = req.body;

    console.log(
      "this is call back -> ",
      rawUsername,
      provider_code,
      amount,
      game_code,
      transaction_id,
      bet_type,
    );

    console.log(
      `\n[${new Date().toISOString()}] CALLBACK IN: ${transaction_id}`,
    );

    if (
      !rawUsername ||
      !provider_code ||
      amount === undefined ||
      !transaction_id ||
      !bet_type
    ) {
      console.warn(`SKIPPED: Missing fields in TX: ${transaction_id}`);
      return res.status(200).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let cleanUsername = String(rawUsername).trim();
    if (cleanUsername.endsWith("45")) {
      cleanUsername = cleanUsername.slice(0, -2);
    }

    const amountFloat = Number.parseFloat(amount);

    if (!Number.isFinite(amountFloat) || amountFloat < 0) {
      return res.status(200).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const player = await User.findOne({ username: cleanUsername });

    if (!player) {
      console.warn(
        `NOT FOUND: User ${cleanUsername} for TX: ${transaction_id}`,
      );
      return res.status(200).json({
        success: false,
        message: "USER_NOT_FOUND",
        data: { username: cleanUsername, transaction_id },
      });
    }

    // duplicate check from GameHistory collection
    let duplicateQuery = null;

    if (verification_key) {
      duplicateQuery = {
        verification_key: String(verification_key).trim(),
      };
    } else {
      duplicateQuery = {
        user: player._id,
        transaction_id: String(transaction_id).trim(),
        bet_type: String(bet_type).trim().toUpperCase(),
      };
    }

    const existingHistory = await GameHistory.findOne(duplicateQuery).lean();

    if (existingHistory) {
      console.log(
        `DUPLICATE: TX ${transaction_id} already in GameHistory. No changes made.`,
      );

      return res.status(200).json({
        success: false,
        message: "DUPLICATE",
        data: {
          status: "DUPLICATE",
          currentBalance: Number(player.balance || 0),
          transaction_id,
        },
      });
    }

    const currentBalance = Number(player.balance || 0);
    const normalizedBetType = String(bet_type).trim().toUpperCase();

    let balanceChange = 0;
    let historyStatus = "pending";
    let winAmount = 0;

    switch (normalizedBetType) {
      case "BET":
        balanceChange = -amountFloat;
        historyStatus = "bet";
        break;

      case "SETTLE":
        balanceChange = amountFloat;
        historyStatus = amountFloat > 0 ? "won" : "settled";
        winAmount = amountFloat;
        break;

      case "REFUND":
        balanceChange = amountFloat;
        historyStatus = "refunded";
        break;

      case "CANCEL":
      case "CANCELBET":
        balanceChange = amountFloat;
        historyStatus = "cancelled";
        break;

      case "BONUS":
        balanceChange = amountFloat;
        historyStatus = "won";
        winAmount = amountFloat;
        break;

      case "PROMO":
        balanceChange = amountFloat;
        historyStatus = "won";
        winAmount = amountFloat;
        break;

      default:
        return res.status(200).json({
          success: false,
          message: "Invalid bet_type",
        });
    }

    if (normalizedBetType === "BET" && currentBalance < amountFloat) {
      console.warn(
        `LOW BALANCE: ${cleanUsername} (Has: ${currentBalance}, Needs: ${amountFloat})`,
      );
      return res.status(200).json({
        success: false,
        message: "INSUFFICIENT_BALANCE",
        data: {
          status: "INSUFFICIENT_BALANCE",
          currentBalance,
          transaction_id,
        },
      });
    }

    const newBalance = currentBalance + balanceChange;

    const updatedPlayer = await User.findByIdAndUpdate(
      player._id,
      { $set: { balance: newBalance } },
      { new: true },
    );

    await GameHistory.create({
      user: player._id,
      username: player.username,
      phone: player.phone || "",
      currency: player.currency || "BDT",
      userRole: player.role || "user",
      provider_code: String(provider_code).trim().toUpperCase(),
      game_code: String(game_code || "").trim(),
      bet_type: normalizedBetType,
      amount: amountFloat,
      win_amount: winAmount,
      balance_after: Number(updatedPlayer.balance || 0),
      transaction_id: String(transaction_id || "").trim(),
      verification_key: verification_key
        ? String(verification_key).trim()
        : null,
      round_id: String(round_id || "").trim(),
      times: String(times || "").trim(),
      status: historyStatus,
      bet_details: bet_details || {},
      flagged: false,
    });

    // BET হলে turnover fillup হবে
    if (normalizedBetType === "BET" && amountFloat > 0) {
      await applyTurnoverProgress({
        userId: player._id,
        wagerAmount: amountFloat,
      });
    }

    console.log(
      `DB ADDED: TX ${transaction_id} | User: ${cleanUsername} | New Bal: ${newBalance}`,
    );

    const duration = Date.now() - startTime;
    console.log(`DONE: ${duration}ms | Final Status: SUCCESS\n`);

    return res.status(200).json({
      success: true,
      message: "SUCCESS",
      data: {
        status: "SUCCESS",
        newBalance: Number(updatedPlayer.balance || 0),
        transaction_id,
      },
    });
  } catch (err) {
    console.error(`SYSTEM ERROR: ${err.message}`);

    if (err?.code === 11000 && err?.keyPattern?.verification_key) {
      return res.status(200).json({
        success: false,
        message: "DUPLICATE",
        data: {
          status: "DUPLICATE",
          duplicateBy: "verification_key",
        },
      });
    }

    return res.status(200).json({
      success: false,
      message: "Internal processing error, but acknowledged",
    });
  }
});

export default router;
