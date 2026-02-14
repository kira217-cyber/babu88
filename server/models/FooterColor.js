import mongoose from "mongoose";

const hex = (v) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const FooterColorSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Default" },
    isActive: { type: Boolean, default: true },

    // Footer wrapper
    footerBg: { type: String, default: "#3b3b3b", validate: [hex, "Invalid HEX"] },

    // Accent (yellow titles)
    accent: { type: String, default: "#f5b400", validate: [hex, "Invalid HEX"] },

    // Borders (dotted lines)
    borderColor: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    borderOpacity: { type: Number, default: 0.25, min: 0, max: 1 },

    // Text colors
    textMain: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    textMuted: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    textMutedOpacity: { type: Number, default: 0.8, min: 0, max: 1 },
    textSoft: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    textSoftOpacity: { type: Number, default: 0.75, min: 0, max: 1 },

    // Social buttons
    socialBg: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    socialBgOpacity: { type: Number, default: 0.15, min: 0, max: 1 },
    socialHoverOpacity: { type: Number, default: 0.25, min: 0, max: 1 },
    socialIcon: { type: String, default: "#ffffff", validate: [hex, "Invalid HEX"] },
    socialIconSize: { type: Number, default: 20, min: 12, max: 40 },

    // Font sizes (px)
    sectionTitleSize: { type: Number, default: 18, min: 10, max: 40 }, // text-lg ~ 18
    taglineSize: { type: Number, default: 16, min: 10, max: 40 },
    copyrightSize: { type: Number, default: 14, min: 10, max: 32 },
    bodySize: { type: Number, default: 16, min: 10, max: 32 },
    smallSize: { type: Number, default: 12, min: 8, max: 24 },
  },
  { timestamps: true }
);

export default mongoose.model("FooterColor", FooterColorSchema);
