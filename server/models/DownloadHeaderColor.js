import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const DownloadHeaderColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // Container styles
    containerBg: {
      type: String,
      default: "#F5F5F5",
      validate: [hex, "Invalid HEX"],
    },
    borderColor: {
      type: String,
      default: "#000000",
      validate: [hex, "Invalid HEX"],
    },
    borderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },

    // Close button
    closeHoverBg: {
      type: String,
      default: "#000000",
      validate: [hex, "Invalid HEX"],
    },
    closeHoverOpacity: { type: Number, default: 0.1, min: 0, max: 1 },
    closeIconColor: {
      type: String,
      default: "#000000",
      validate: [hex, "Invalid HEX"],
    },
    closeIconOpacity: { type: Number, default: 0.8, min: 0, max: 1 },
    closeIconSize: { type: Number, default: 24, min: 12, max: 48 },

    // Icon box
    iconBoxBg: {
      type: String,
      default: "#000000",
      validate: [hex, "Invalid HEX"],
    },
    fallbackLetter: { type: String, default: "B" },
    fallbackLetterColor: {
      type: String,
      default: "#F5B400",
      validate: [hex, "Invalid HEX"],
    },
    fallbackLetterSize: { type: Number, default: 20, min: 10, max: 48 },

    // Title text
    titleColor: {
      type: String,
      default: "#000000",
      validate: [hex, "Invalid HEX"],
    },
    titleSize: { type: Number, default: 13, min: 10, max: 24 },

    // Download button
    btnBg: {
      type: String,
      default: "#F5B400",
      validate: [hex, "Invalid HEX"],
    },
    btnText: {
      type: String,
      default: "#000000",
      validate: [hex, "Invalid HEX"],
    },
    btnTextSize: { type: Number, default: 14, min: 10, max: 24 },
    btnBorderColor: {
      type: String,
      default: "#000000",
      validate: [hex, "Invalid HEX"],
    },
    btnBorderOpacity: { type: Number, default: 0.1, min: 0, max: 1 },
    btnDisabledOpacity: { type: Number, default: 0.6, min: 0, max: 1 },
  },
  { timestamps: true },
);

export default mongoose.model("DownloadHeaderColor", DownloadHeaderColorSchema);
