// models/SingleBanner.js
import mongoose from "mongoose";

const singleBannerSchema = new mongoose.Schema(
  {
    desktopBannerUrl: { type: String, default: "" }, // /uploads/xxx.jpg
    mobileBannerUrl: { type: String, default: "" }, // /uploads/xxx.jpg

    clickLink: { type: String, default: "" }, // optional: /register or https://...
    openInNewTab: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

singleBannerSchema.statics.getDefault = function () {
  return {
    desktopBannerUrl: "",
    mobileBannerUrl: "",
    clickLink: "",
    openInNewTab: false,
    isActive: true,
  };
};

const SingleBanner = mongoose.model("SingleBanner", singleBannerSchema);
export default SingleBanner;
