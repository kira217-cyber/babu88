// models/Jackpot.js
import mongoose from "mongoose";

const JackpotSchema = new mongoose.Schema(
  {
    // images (local uploads path like "/uploads/xxx.png")
    bgImage: { type: String, default: "" },
    miniBoxImage: { type: String, default: "" },
    grandBoxImage: { type: String, default: "" },
    majorBoxImage: { type: String, default: "" },

    // values
    miniAmount: { type: Number, default: 0 },
    grandAmount: { type: Number, default: 0 },
    majorAmount: { type: Number, default: 0 },

    // enable/disable
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ single config document
export default mongoose.model("Jackpot", JackpotSchema);