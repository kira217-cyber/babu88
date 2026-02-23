// src/pages/Profile/Referral/DownlineReport.jsx
import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";


const DownlineReport = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  return (
    <div className="bg-white rounded-2xl border border-black/10 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      {/* Title */}
      <div className="text-[15px] md:text-[16px] font-extrabold text-black flex items-center gap-2">
        👥 {t("ডাউনলাইন রিপোর্ট", "Downline Report")}
      </div>

      {/* Divider */}
      <div className="w-10 h-[3px] bg-gradient-to-r from-violet-400 to-purple-500 mt-3 rounded-full" />

      {/* Description */}
      <p className="mt-4 text-[13px] md:text-[14px] text-black/70 leading-relaxed">
        {t(
          "আপনার ডাউনলাইনের সকল ব্যবহারকারীর তথ্য এবং কার্যক্রম এখানে দেখানো হবে। এই ফিচারটি বর্তমানে নির্মাণাধীন রয়েছে।",
          "All information and activity of your downline users will be shown here. This feature is currently under construction.",
        )}
      </p>

      {/* Highlight box */}
      <div className="mt-5 rounded-xl bg-violet-50 border border-violet-200 p-4">
        <p className="text-[13px] md:text-[14px] font-medium text-violet-800">
          {t(
            "🚧 কাজ চলছে! খুব শীঘ্রই সম্পূর্ণ ডাউনলাইন রিপোর্ট দেখতে পারবেন।",
            "🚧 Work in progress! You’ll be able to view full downline reports very soon.",
          )}
        </p>
      </div>

      {/* Footer note */}
      <p className="mt-4 text-[12px] text-black/50">
        {t(
          "নতুন আপডেট এলে আপনাকে জানানো হবে।",
          "You’ll be notified once new updates are available.",
        )}
      </p>
    </div>
  );
};

export default DownlineReport;
