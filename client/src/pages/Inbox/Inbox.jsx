// src/pages/Inbox/Inbox.jsx
import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";


const Inbox = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 md:p-8 text-center">
        {/* Title */}
        <h1 className="text-[22px] md:text-[26px] font-extrabold text-black">
          {t("📩 ইনবক্স", "📩 Inbox")}
        </h1>

        {/* Divider */}
        <div className="w-16 h-[3px] bg-gradient-to-r from-sky-400 to-indigo-500 mx-auto my-4 rounded-full" />

        {/* Main Text */}
        <p className="text-[14px] md:text-[15px] text-black/70 leading-relaxed">
          {t(
            "আপনার সকল নোটিফিকেশন, মেসেজ এবং গুরুত্বপূর্ণ আপডেট এখানে দেখা যাবে। এই ফিচারটি বর্তমানে নির্মাণাধীন রয়েছে।",
            "All your notifications, messages, and important updates will appear here. This feature is currently under construction.",
          )}
        </p>

        {/* Highlight Box */}
        <div className="mt-6 rounded-xl bg-sky-50 border border-sky-200 p-4">
          <p className="text-[13px] md:text-[14px] font-medium text-sky-800">
            {t(
              "🚧 কাজ চলছে! খুব শীঘ্রই ইনবক্স লাইভ হবে।",
              "🚧 Work in progress! Inbox will be live very soon.",
            )}
          </p>
        </div>

        {/* Footer Note */}
        <p className="mt-5 text-[12px] text-black/50">
          {t(
            "ইনবক্স চালু হলে আপনি সব আপডেট এক জায়গায় পাবেন।",
            "Once Inbox goes live, you’ll get all updates in one place.",
          )}
        </p>
      </div>
    </div>
  );
};

export default Inbox;
