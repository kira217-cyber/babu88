import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const BottomNavbarColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // Logged OUT buttons
    logoutLoginBg: { type: String, default: "#FFCE01", validate: [hex, "Invalid HEX"] },
    logoutLoginText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    logoutLoginTextSize: { type: Number, default: 16, min: 10, max: 28 },

    logoutRegisterBg: { type: String, default: "#0066D1", validate: [hex, "Invalid HEX"] },
    logoutRegisterText: { type: String, default: "#FFFFFF", validate: [hex, "Invalid HEX"] },
    logoutRegisterTextSize: { type: Number, default: 16, min: 10, max: 28 },

    // Logged IN bar
    barBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    barBorder: { type: String, default: "#FFFFFF", validate: [hex, "Invalid HEX"] },
    barBorderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },

    // Icon circle
    iconActiveBg: { type: String, default: "#FFCE01", validate: [hex, "Invalid HEX"] },
    iconInactiveBg: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },

    // Icon color
    iconActiveText: { type: String, default: "#000000", validate: [hex, "Invalid HEX"] },
    iconInactiveText: { type: String, default: "#FFFFFF", validate: [hex, "Invalid HEX"] },

    // Icon size (px)
    iconSize: { type: Number, default: 16, min: 10, max: 28 },

    // Label text under icon
    labelText: { type: String, default: "#FFFFFF", validate: [hex, "Invalid HEX"] },
    labelOpacity: { type: Number, default: 0.95, min: 0, max: 1 },
    labelTextSize: { type: Number, default: 11, min: 8, max: 18 },

    // (Optional) icon circle size if you ever want later
    // iconCircleSize: { type: Number, default: 32, min: 24, max: 48 },
  },
  { timestamps: true }
);

export default mongoose.model("BottomNavbarColor", BottomNavbarColorSchema);
