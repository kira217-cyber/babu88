// models/Download.js
import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
  {
    // bilingual text
    titleBn: { type: String, default: "" },
    titleEn: { type: String, default: "" },

    subBn: { type: String, default: "" },
    subEn: { type: String, default: "" },

    btnDownloadBn: { type: String, default: "" },
    btnDownloadEn: { type: String, default: "" },

    btnAndroidBn: { type: String, default: "" },
    btnAndroidEn: { type: String, default: "" },

    // uploaded assets urls
    apkUrl: { type: String, default: "" },
    rightImageUrl: { type: String, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

downloadSchema.statics.getDefault = function () {
  return {
    titleBn:
      "অফিসিয়াল BABU88 মোবাইল অ্যাপ চালু হতে যাচ্ছে।\nযেতে যেতে নির্দিষ্ট গেম উপভোগ করুন!",
    titleEn:
      "Official BABU88 mobile app is coming soon.\nEnjoy your favorite games on the go!",

    subBn: "ডাউনলোড করুন এবং ইউজারের মধ্যে দূর দিন!",
    subEn: "Download now and get started in seconds!",

    btnDownloadBn: "এখনই ডাউনলোড করুন",
    btnDownloadEn: "Download Now",

    btnAndroidBn: "Android এ উপলব্ধ",
    btnAndroidEn: "Available on Android",

    apkUrl: "",
    rightImageUrl: "",
    isActive: true,
  };
};

const Download = mongoose.model("Download", downloadSchema);
export default Download;
