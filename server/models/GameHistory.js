import mongoose from "mongoose";

const { Schema } = mongoose;

const gameHistorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
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

    userGamePlayName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    member_account: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
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

    game_uid: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    game_round: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    serial_number: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    bet_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    win_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    net_amount: {
      type: Number,
      required: true,
    },

    resultType: {
      type: String,
      enum: ["win", "loss", "push"],
      required: true,
      index: true,
    },

    balance_before: {
      type: Number,
      required: true,
    },

    balance_after: {
      type: Number,
      required: true,
    },

    oracleTimestamp: {
      type: String,
      default: "",
      trim: true,
    },

    rawPayload: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

gameHistorySchema.index({ user: 1, createdAt: -1 });
gameHistorySchema.index({ user: 1, game_uid: 1, createdAt: -1 });
gameHistorySchema.index({ resultType: 1, createdAt: -1 });
gameHistorySchema.index({ userGamePlayName: 1, createdAt: -1 });

const GameHistory = mongoose.model("GameHistory", gameHistorySchema);

export default GameHistory;
