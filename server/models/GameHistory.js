import mongoose from "mongoose";

const { Schema } = mongoose;

const gameHistorySchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    currency: {
      type: String,
      enum: ["BDT", "USDT"],
      default: "BDT",
    },

    userRole: {
      type: String,
      default: "user",
      index: true,
    },

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

    bet_type: {
      type: String,
      enum: [
        "BET",
        "SETTLE",
        "CANCEL",
        "REFUND",
        "BONUS",
        "PROMO",
        "CANCELBET",
      ],
      required: true,
      index: true,
    },

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
      default: 0,
    },

    // ✅ duplicate হতে পারবে
    transaction_id: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // ✅ always unique
    verification_key: {
      type: String,
      default: null,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    round_id: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    times: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "bet",
        "settled",
        "won",
        "lost",
        "push",
        "cancelled",
        "refunded",
        "error",
        "void",
      ],
      default: "pending",
      index: true,
    },

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
    timestamps: true,
  },
);

gameHistorySchema.index({ user: 1, createdAt: -1 });
gameHistorySchema.index({ status: 1, createdAt: -1 });
gameHistorySchema.index({ provider_code: 1, status: 1 });
gameHistorySchema.index({ transaction_id: 1 });
gameHistorySchema.index({ user: 1, provider_code: 1, createdAt: -1 });
gameHistorySchema.index({ user: 1, game_code: 1, createdAt: -1 });

// optional: user + verification_key fast lookup
gameHistorySchema.index({ user: 1, verification_key: 1 });

export default mongoose.model("GameHistory", gameHistorySchema);
