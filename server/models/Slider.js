// models/Slider.js
import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true }, // /uploads/xxx.png
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Slider = mongoose.model("Slider", sliderSchema);
export default Slider;
