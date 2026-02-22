// models/TurnOver.js
import mongoose from "mongoose";

const TurnOverSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // link to deposit request
    depositRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DepositRequest",
      required: true,
      unique: true,
    },

    required: { type: Number, required: true, min: 0 }, // targetTurnover
    progress: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["running", "completed"],
      default: "running",
      index: true,
    },

    // optional: how much balance credited from this deposit
    creditedAmount: { type: Number, default: 0 },

    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

TurnOverSchema.index({ user: 1, status: 1 });

export default mongoose.model("TurnOver", TurnOverSchema);