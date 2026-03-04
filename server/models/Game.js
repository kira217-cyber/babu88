// models/Game.js
import mongoose from "mongoose";

const GameSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameCategory",
      required: true,
      index: true,
    },
    providerDbId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GameProvider",
      required: true,
      index: true,
    },

    // oracle source ids
    gameId: { type: String, required: true }, // oracle game._id
    gameUuid: { type: String, default: "" }, // oracle game.game_uuid

    // ← NEW FIELD
    gameName: { type: String, trim: true, default: "" },

    // optional admin overrides
    image: { type: String, default: "" }, // "/uploads/xxx.png" OR remote url

    isHot: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },

    // ✅ NEW: Jackpot flag
    isJackpot: { type: Boolean, default: false },

    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

// Prevent duplicate game per provider
GameSchema.index({ providerDbId: 1, gameId: 1 }, { unique: true });

export default mongoose.model("Game", GameSchema);
