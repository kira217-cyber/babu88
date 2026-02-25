// models/LiveGameGlobal.js
import mongoose from "mongoose";

const liveGameGlobalSchema = new mongoose.Schema(
  {
    gameUID: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("LiveGameGlobal", liveGameGlobalSchema);
