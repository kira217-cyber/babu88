import mongoose from "mongoose";

const affFloatingSocialSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, default: "" }, // uploaded image url
    linkUrl: { type: String, default: "" },  // click link
  },
  { timestamps: true }
);

export default mongoose.model("AffFloatingSocial", affFloatingSocialSchema);
