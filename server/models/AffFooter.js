import mongoose from "mongoose";

const ImgItemSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { _id: false }
);

const SocialLinksSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
    instagram: { type: String, default: "" },
    telegram: { type: String, default: "" },
  },
  { _id: false }
);

const affFooterSchema = new mongoose.Schema(
  {
    // ✅ LEFT TEXT
    leftTitleBn: { type: String, default: "" },
    leftTitleEn: { type: String, default: "" },
    leftBodyBn: { type: String, default: "" },
    leftBodyEn: { type: String, default: "" },

    // ✅ HEADERS
    rightTitleBn: { type: String, default: "" },
    rightTitleEn: { type: String, default: "" },

    responsibleTitleBn: { type: String, default: "" },
    responsibleTitleEn: { type: String, default: "" },

    paymentTitleBn: { type: String, default: "" },
    paymentTitleEn: { type: String, default: "" },

    followTitleBn: { type: String, default: "" },
    followTitleEn: { type: String, default: "" },

    // ✅ COPYRIGHT
    copyrightBn: { type: String, default: "" },
    copyrightEn: { type: String, default: "" },

    // ✅ OFFICIAL LOGO
    officialLogoUrl: { type: String, default: "" },

    // ✅ ARRAYS
    partners: { type: [ImgItemSchema], default: [] },
    paymentMethods: { type: [ImgItemSchema], default: [] },
    responsible: { type: [ImgItemSchema], default: [] },

    // ✅ SOCIAL LINKS
    socialLinks: { type: SocialLinksSchema, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("AffFooter", affFooterSchema);
