import mongoose from "mongoose";

const affSiteMetaSchema = new mongoose.Schema(
  {
    titleBn: { type: String, default: "" },
    titleEn: { type: String, default: "" },

    faviconUrl: { type: String, default: "" }, // uploaded url
    logoUrl: { type: String, default: "" }, // uploaded url
  },
  { timestamps: true }
);

export default mongoose.model("AffSiteMeta", affSiteMetaSchema);
