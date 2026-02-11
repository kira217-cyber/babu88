// models/SingleBanner.js
import mongoose from "mongoose";

const singleBannerSchema = new mongoose.Schema(
  {
    bannerUrl: { type: String, default: "" }, // /uploads/xxx.jpg
    clickLink: { type: String, default: "" }, // optional: /register or https://...
    openInNewTab: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

singleBannerSchema.statics.getDefault = function () {
  return {
    bannerUrl: "",
    clickLink: "",
    openInNewTab: false,
    isActive: true,
  };
};

const SingleBanner = mongoose.model("SingleBanner", singleBannerSchema);
export default SingleBanner;
