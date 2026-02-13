import mongoose from "mongoose";

const affSliderSchema = new mongoose.Schema(
  {
    // slider images list
    slides: {
      type: [String], // ✅ array of image URLs
      default: [],
    },

    // optional settings (future use)
    autoPlayDelay: { type: Number, default: 2000 },
    loop: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("AffSlider", affSliderSchema);
