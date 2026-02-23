// src/pages/Reward/Reward.jsx
import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";


const Reward = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 md:p-8 text-center">
        {/* Title */}
        <h1 className="text-[22px] md:text-[26px] font-extrabold text-black">
          {t("🎁 রিওয়ার্ড", "🎁 Rewards")}
        </h1>

        {/* Divider */}
        <div className="w-16 h-[3px] bg-gradient-to-r from-emerald-400 to-green-600 mx-auto my-4 rounded-full" />

        {/* Main Text */}
        <p className="text-[14px] md:text-[15px] text-black/70 leading-relaxed">
          {t(
            "এখানে আপনি আপনার অর্জিত রিওয়ার্ড, বোনাস এবং বিশেষ উপহারগুলো দেখতে পারবেন। এই ফিচারটি বর্তমানে নির্মাণাধীন রয়েছে।",
            "Here you’ll be able to see your earned rewards, bonuses, and special gifts. This feature is currently under construction.",
          )}
        </p>

        {/* Highlight Box */}
        <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
          <p className="text-[13px] md:text-[14px] font-medium text-emerald-800">
            {t(
              "🚧 কাজ চলছে! শীঘ্রই রিওয়ার্ড সিস্টেম চালু হবে।",
              "🚧 Work in progress! The reward system will be available soon.",
            )}
          </p>
        </div>

        {/* Footer Note */}
        <p className="mt-5 text-[12px] text-black/50">
          {t(
            "রিওয়ার্ড চালু হলে আপনি আপনার সব অর্জন এক জায়গায় দেখতে পারবেন।",
            "Once rewards go live, you’ll see all your achievements in one place.",
          )}
        </p>
      </div>
    </div>
  );
};

export default Reward;
