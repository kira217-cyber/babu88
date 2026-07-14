import mongoose from "mongoose";

const { Schema } = mongoose;

const nineWicketWalletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    totalTransferred: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalReturned: {
      type: Number,
      default: 0,
      min: 0,
    },

    exposureBalance: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    lastTransferAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastReturnedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastTransferAt: {
      type: Date,
      default: null,
    },

    lastSyncAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["idle", "playing", "exposure", "settled"],
      default: "idle",
      index: true,
    },
  },
  { timestamps: true },
);

nineWicketWalletSchema.index({ username: 1 });
nineWicketWalletSchema.index({ status: 1, exposureBalance: -1 });

export default mongoose.model("NineWicketWallet", nineWicketWalletSchema);
