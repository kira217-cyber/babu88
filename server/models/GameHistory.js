import mongoose from "mongoose";

const gameHistorySchema = new mongoose.Schema(
  {
    // ─── Provider / Game Info ─────────────────────────────
    provider_code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    game_code: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ─── Bet Type ─────────────────────────────────────────
    bet_type: {
      type: String,
      enum: ["BET", "SETTLE", "CANCEL", "REFUND", "BONUS", "PROMO"],
      required: true,
      index: true,
    },

    // ─── Amount Info ──────────────────────────────────────
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    win_amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    balance_after: {
      type: Number,
    },

    // ─── Provider References ──────────────────────────────
    transaction_id: {
      type: String,
      index: true,
    },

    round_id: {
      type: String,
      sparse: true,
    },

    verification_key: {
      type: String,
      sparse: true,
    },

    times: {
      type: String,
      trim: true,
    },

    // ─── Status (Realistic for betting systems) ───────────
    status: {
      type: String,
      enum: [
        "pending",     // bet placed, waiting result
        "bet",         // bet accepted
        "settled",     // settled by provider
        "won",
        "lost",
        "push",        // draw / tie
        "cancelled",
        "refunded",
        "error",       // provider/system error
        "void",        // voided bet
      ],
      default: "pending",
      index: true,
    },

    // ─── Extra Details ────────────────────────────────────
    bet_details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    flagged: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ─── Indexes (Optimized) ──────────────────────────────────
gameHistorySchema.index({ createdAt: -1 });                    // recent games
gameHistorySchema.index({ status: 1, createdAt: -1 });         // status-wise history
gameHistorySchema.index({ provider_code: 1, status: 1 });      // provider reports
gameHistorySchema.index({ transaction_id: 1 });                // duplicate protection

// ⚠️ If later you add user reference inside this schema
// gameHistorySchema.add({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" } });
// gameHistorySchema.index({ user: 1, createdAt: -1 });

export default gameHistorySchema;