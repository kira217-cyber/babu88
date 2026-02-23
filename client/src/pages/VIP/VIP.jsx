// src/pages/VIP/VIP.jsx
import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const VIP = () => {
  const { isBangla } = useLanguage();

  const t = (bn, en) => (isBangla ? bn : en);

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 md:p-8 text-center">
        {/* Title */}
        <h1 className="text-[22px] md:text-[26px] font-extrabold text-black">
          {t("🌟 ভিআইপি প্রোগ্রাম", "🌟 VIP Program")}
        </h1>

        {/* Divider */}
        <div className="w-16 h-[3px] bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto my-4 rounded-full" />

        {/* Main Text */}
        <p className="text-[14px] md:text-[15px] text-black/70 leading-relaxed">
          {t(
            "আমাদের ভিআইপি প্রোগ্রামটি বর্তমানে নির্মাণাধীন রয়েছে। খুব শীঘ্রই এখানে আপনি পাবেন এক্সক্লুসিভ বোনাস, বিশেষ অফার এবং প্রিমিয়াম সুবিধা।",
            "Our VIP program is currently under construction. Very soon you will enjoy exclusive bonuses, special offers, and premium benefits here.",
          )}
        </p>

        {/* Highlight Box */}
        <div className="mt-6 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-[13px] md:text-[14px] font-medium text-yellow-800">
            {t(
              "🚧 কাজ চলছে! নতুন আপডেটের জন্য আমাদের সাথে থাকুন।",
              "🚧 Work in progress! Stay with us for upcoming updates.",
            )}
          </p>
        </div>

        {/* Footer Note */}
        <p className="mt-5 text-[12px] text-black/50">
          {t(
            "এই ফিচারটি চালু হলে আপনাকে নোটিফিকেশনের মাধ্যমে জানানো হবে।",
            "You will be notified once this feature goes live.",
          )}
        </p>
      </div>
    </div>
  );
};

export default VIP;
