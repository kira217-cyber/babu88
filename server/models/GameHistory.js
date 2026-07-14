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

    /**
     * Normal Oracle game username.
     */
    userGamePlayName: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    /**
     * NineWicket-এর 6-character username.
     */
    nineWicketUsername: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      index: true,
    },

    /**
     * Callback provider.
     */
    provider: {
      type: String,
      enum: ["oracle", "ninewicket"],
      default: "oracle",
      required: true,
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

    /**
     * Same game_round multiple callbacks-এ আসতে পারবে।
     * তাই এটি unique নয়।
     */
    game_round: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    /**
     * শুধু serial_number unique থাকবে।
     */
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

    /**
     * NineWicket callback fields
     */

    nineWicketBetId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    nineWicketBetStatus: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    matchStake: {
      type: Number,
      default: 0,
      min: 0,
    },

    profitLoss: {
      type: Number,
      default: 0,
    },

    /**
     * NineWicket event type name.
     * Example: Book CRICKET
     */
    eventTypeName: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    /**
     * NineWicket event name.
     * Example: Derbyshire v Somerset
     */
    eventName: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    /**
     * NineWicket market name.
     * Example: Bookmaker
     */
    marketName: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    /**
     * NineWicket competition name.
     * Example: T20 Blast
     */
    competitionName: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    /**
     * এই callback-এর exposure change.
     */
    exposureChange: {
      type: Number,
      default: 0,
    },

    /**
     * Callback process হওয়ার পর final exposure.
     */
    exposureAfter: {
      type: Number,
      default: 0,
      min: 0,
    },

    oracleTimestamp: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * Complete callback payload.
     */
    rawPayload: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

/* =========================================================
   EXISTING INDEXES
========================================================= */

gameHistorySchema.index({
  user: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  user: 1,
  game_uid: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  resultType: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  userGamePlayName: 1,
  createdAt: -1,
});

/* =========================================================
   NINE WICKET INDEXES
========================================================= */

gameHistorySchema.index({
  nineWicketUsername: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  provider: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  user: 1,
  provider: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  nineWicketBetStatus: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  nineWicketBetId: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  eventTypeName: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  eventName: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  marketName: 1,
  createdAt: -1,
});

gameHistorySchema.index({
  competitionName: 1,
  createdAt: -1,
});

const GameHistory = mongoose.model("GameHistory", gameHistorySchema);

export default GameHistory;
