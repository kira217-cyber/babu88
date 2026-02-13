import mongoose from "mongoose";

const affNoticeSchema = new mongoose.Schema(
  {
    textBn: { type: String, default: "" },
    textEn: { type: String, default: "" },

    // optional: speed control (seconds)
    speedSec: { type: Number, default: 16 },
  },
  { timestamps: true }
);

export default mongoose.model("AffNotice", affNoticeSchema);
