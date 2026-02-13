import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    titleBn: { type: String, default: "" },
    titleEn: { type: String, default: "" },
    descBn: { type: String, default: "" },
    descEn: { type: String, default: "" },
  },
  { _id: false }
);

const affWhyUsSchema = new mongoose.Schema(
  {
    sectionTitleBn: { type: String, default: "" },
    sectionTitleEn: { type: String, default: "" },

    // ✅ 4 items (but you can keep it flexible)
    items: { type: [ItemSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("AffWhyUs", affWhyUsSchema);
