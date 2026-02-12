// models/Promotions.js
import mongoose from "mongoose";

const langTextSchema = new mongoose.Schema(
  {
    bn: { type: String, required: true },
    en: { type: String, required: true },
  },
  { _id: false }
);

const promotionSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    image: { type: String, required: true }, // will store "/uploads/xxx.jpg" OR external url
    title: { type: langTextSchema, required: true },
    shortDesc: { type: langTextSchema, required: true },
    details: { type: langTextSchema, required: true },
  },
  { timestamps: true }
);

const Promotion = mongoose.model("Promotion", promotionSchema);
export default Promotion;
