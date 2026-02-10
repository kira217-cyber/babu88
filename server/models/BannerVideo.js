// models/BannerVideo.js
import mongoose from "mongoose";

const bannerVideoSchema = new mongoose.Schema(
  {
    titleBn: { type: String, default: "" },
    titleEn: { type: String, default: "" },

    bannerImg: { type: String, required: true }, // /uploads/xxx.jpg
    youtube: { type: String, default: "" }, // optional

    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // sorting
  },
  { timestamps: true },
);

const BannerVideo = mongoose.model("BannerVideo", bannerVideoSchema);
export default BannerVideo;
