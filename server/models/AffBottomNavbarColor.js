// models/AffBottomNavbarColor.js
import mongoose from "mongoose";

const affBottomNavbarColorSchema = new mongoose.Schema(
  {
    // Bar
    barBg: { type: String, default: "#2b2b2b" },
    barBorderTop: { type: String, default: "rgba(255,255,255,0.10)" },

    // Wrapper padding
    padX: { type: Number, default: 12 }, // px (px-3)
    padY: { type: Number, default: 8 },  // px (py-2)
    gap: { type: Number, default: 12 },  // px (gap-3)

    // Button common
    btnTextSize: { type: Number, default: 14 }, // text-sm
    btnRadius: { type: Number, default: 6 },    // rounded-md
    btnPadY: { type: Number, default: 12 },     // py-3

    // Login button
    loginBg: { type: String, default: "#3f3f3f" },
    loginHoverBg: { type: String, default: "#4b4b4b" },
    loginText: { type: String, default: "#ffffff" },
    loginActiveRing: { type: String, default: "#f5b400" },
    loginActiveRingWidth: { type: Number, default: 2 },

    // Register button
    registerBg: { type: String, default: "#f5b400" },
    registerHoverBg: { type: String, default: "#e2a800" },
    registerText: { type: String, default: "#000000" },
    registerActiveRing: { type: String, default: "rgba(0,0,0,0.40)" },
    registerActiveRingWidth: { type: Number, default: 2 },
  },
  { timestamps: true },
);

export default mongoose.model(
  "AffBottomNavbarColor",
  affBottomNavbarColorSchema,
);
