// models/GameProvider.js
import mongoose from "mongoose";

const GameProviderSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameCategory",
      required: true,
      index: true,
    },

    providerName: { type: String, required: true },
    providerId: { type: String, required: true },

    providerImage: { type: String, default: "" }, // "/uploads/xxx.png"
    providerIcon: { type: String, default: "" }, // "/uploads/xxx.png"

    // ✅ NEW FIELDS
    isHot: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },

    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

// একই category এর মধ্যে একই providerId duplicate না রাখতে চাইলে:
GameProviderSchema.index({ categoryId: 1, providerId: 1 }, { unique: true });

export default mongoose.model("GameProvider", GameProviderSchema);