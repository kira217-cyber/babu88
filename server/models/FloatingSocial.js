// models/FloatingSocial.js
import mongoose from "mongoose";

const floatingSocialSchema = new mongoose.Schema(
  {
    items: [
      {
        iconUrl: { type: String, default: "" }, // /uploads/xxx.png
        url: { type: String, default: "" },     // full url
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

floatingSocialSchema.statics.getDefault = function () {
  return {
    items: [],
  };
};

const FloatingSocial = mongoose.model("FloatingSocial", floatingSocialSchema);
export default FloatingSocial;
