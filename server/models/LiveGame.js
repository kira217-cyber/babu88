// models/LiveGame.js
import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    countryImage: { type: String, required: true, trim: true }, // URL or uploaded file URL
  },
  { _id: false },
);

const liveGameSchema = new mongoose.Schema(
  {
    gameUID: { type: String, required: true, unique: true, index: true, trim: true },

    statusText: { type: String, required: true, trim: true }, // e.g. "2nd Innings"
    statusType: {
      type: String,
      required: true,
      enum: ["live", "upcoming"],
      default: "live",
    },

    title: { type: String, required: true, trim: true },

    // You can keep as string (your current format), or change to Date later
    datetime: { type: String, required: true, trim: true },

    teams: {
      type: [teamSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 2,
        message: "Teams must contain exactly 2 items.",
      },
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("LiveGame", liveGameSchema);
