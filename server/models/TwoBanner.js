// models/TwoBanner.js
import mongoose from "mongoose";

const twoBannerSchema = new mongoose.Schema(
  {
    // Images
    leftBannerUrl: { type: String, default: "" },   // /uploads/xxx.jpg
    rightBannerUrl: { type: String, default: "" },  // /uploads/yyy.jpg

    // Texts (bilingual)
    titleBn: { type: String, default: "" },
    titleEn: { type: String, default: "" },

    descriptionBn: { type: String, default: "" },
    descriptionEn: { type: String, default: "" },

    buttonTextBn: { type: String, default: "" },
    buttonTextEn: { type: String, default: "" },

    // Button action
    buttonLink: { type: String, default: "" }, // internal route or external URL
    openInNewTab: { type: Boolean, default: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

twoBannerSchema.statics.getDefault = function () {
  return {
    leftBannerUrl: "",
    rightBannerUrl: "",

    titleBn: "বন্ধুদের রেফার করে আয় শুরু করুন",
    titleEn: "Refer friends and start earning",

    descriptionBn:
      "বাংলাদেশের নং ১ ফ্রেন্ড রেফারেল প্রোগ্রাম এখন এখানে! একজন বন্ধুকে রেফার করে ফ্রি ৳৫০০ উপভোগ করুন এবং আপনার বন্ধু প্রতিবার জমা দিলে আনলিমিটেড সর্বোচ্চ % কমিশন পান!",
    descriptionEn:
      "Bangladesh's No.1 Friend Referral Program is here! Refer a friend and enjoy free ৳500, plus earn unlimited maximum % commission every time your friend deposits!",

    buttonTextBn: "এখনই রেফার করুন",
    buttonTextEn: "Refer Now",

    buttonLink: "/refer",
    openInNewTab: true,
    isActive: true,
  };
};

const TwoBanner = mongoose.model("TwoBanner", twoBannerSchema);
export default TwoBanner;
