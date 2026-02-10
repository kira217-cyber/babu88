// models/Notice.js
import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    noticeBn: { type: String, required: true, default: "" },
    noticeEn: { type: String, required: true, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// ✅ Default data (Footer এর মতো)
noticeSchema.statics.getDefault = function () {
  return {
    noticeBn:
      "পেমেন্ট কদই, বা OTP কারো সাথে শেয়ার করবেন না। এছাড়াও, তুমি প্যাকের রেটিং লিংকে ক্লিক করবেন না। সহায়তার জন্য, নিচে উল্লেখিত লাইভ চ্যাটের মাধ্যমে আমাদের সাথে যোগাযোগ করুন।",
    noticeEn:
      "Never share your payment code or OTP with anyone. Also, do not click on any suspicious rating or recharge links. For support, contact us via the live chat below.",
    isActive: true,
  };
};

const Notice = mongoose.model("Notice", noticeSchema);
export default Notice;
