// models/SiteBranding.js
import mongoose from "mongoose";

const siteBrandingSchema = new mongoose.Schema(
  {
    titleBn: { type: String, default: "" },
    titleEn: { type: String, default: "" },

    faviconUrl: { type: String, default: "" }, // /uploads/xxx.png
    logoUrl: { type: String, default: "" }, // /uploads/yyy.png

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

siteBrandingSchema.statics.getDefault = function () {
  return {
    titleBn: "ওয়েবসাইট টাইটেল",
    titleEn: "Website Title",
    faviconUrl: "",
    logoUrl: "",
    isActive: true,
  };
};

const SiteBranding = mongoose.model("SiteBranding", siteBrandingSchema);
export default SiteBranding;
