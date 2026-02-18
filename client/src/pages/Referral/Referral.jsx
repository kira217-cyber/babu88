// src/pages/Profile/Referral/Referral.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import MyReferrals from "./MyReferrals";
import ReferralReport from "./ReferralReport";
import RedeemHistory from "./RedeemHistory";
import DownlineReport from "./DownlineReport";
import { selectIsAuthenticated, selectUser } from "../../features/auth/authSelectors";
import { useLanguage } from "../../Context/LanguageProvider";

const Referral = () => {
  const { isBangla } = useLanguage();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const username = user?.username || "Guest";
  const referralCode = user?.referralCode || "";

  const t = (bn, en) => (isBangla ? bn : en);

  const sections = useMemo(
    () => [
      {
        id: "my-referrals",
        name: t("আমার রেফারেলস", "My Referrals"),
        component: <MyReferrals />,
      },
      {
        id: "referral-report",
        name: t("রেফারেল রিপোর্ট", "Referral Report"),
        component: <ReferralReport />,
      },
      {
        id: "redeem-history",
        name: t("রিডিম ইতিহাস", "Redeem History"),
        component: <RedeemHistory />,
      },
      {
        id: "downline-report",
        name: t("ডাউনলাইন রিপোর্ট", "Downline Report"),
        component: <DownlineReport />,
      },
    ],
    [isBangla], // recompute when language changes
  );

  // Default active: "My Referrals"
  const [activeSection, setActiveSection] = useState("my-referrals");

  const toggleSection = (id) => {
    setActiveSection((prev) => (prev === id ? null : id));
  };

  // Optional guard
  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center text-black/70">
        {t("অনুগ্রহ করে লগইন করুন", "Please log in to view referral details.")}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Banner Section */}
      <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="relative overflow-hidden rounded-xl h-[120px] sm:h-[140px]">
          {/* Gradient BG */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f7c900] via-[#ffd95a] to-[#f7c900]" />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_55%),radial-gradient(circle_at_70%_30%,white_0%,transparent_60%)]" />

          {/* Decorative coins */}
          <div className="absolute -left-3 -top-3 w-10 h-10 rounded-full bg-[#ffcf2d] shadow-md border border-black/10 rotate-12" />
          <div className="absolute -left-2 bottom-[-10px] w-10 h-10 rounded-full bg-[#ffcf2d] shadow-md border border-black/10 -rotate-12" />
          <div className="absolute right-[-12px] top-[-10px] w-10 h-10 rounded-full bg-[#ffcf2d] shadow-md border border-black/10 rotate-12" />
          <div className="absolute right-[-14px] bottom-[-12px] w-10 h-10 rounded-full bg-[#ffcf2d] shadow-md border border-black/10 -rotate-12" />

          {/* Gift icon placeholder */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block">
            <div className="relative w-[110px] h-[80px] rounded-2xl bg-[#8b5cf6] shadow-[0_10px_25px_rgba(0,0,0,0.18)]">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-5 h-full bg-[#f5c400]" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-5 bg-[#f5c400]" />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 rounded-full bg-[#f5c400]" />
            </div>
          </div>

          {/* Text content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="px-5 sm:px-8">
              <p className="text-[12px] sm:text-[13px] font-semibold text-black/80">
                {t(
                  "আপনি যে প্রতিটি বন্ধুকে রেফার করবেন",
                  "Every friend you refer, you will get free",
                )}
              </p>
              <div className="mt-1 text-[22px] sm:text-[26px] font-extrabold text-black">
                ৳500
              </div>
              <p className="mt-1 text-[12px] sm:text-[13px] font-semibold text-black/70">
                {t(
                  "আপনার বন্ধুরাও পাবে ফ্রি ৳৫০০!",
                  "Your friends will receive a free ৳500 too!",
                )}
              </p>

              {/* Small referral code hint (mobile friendly) */}
              {referralCode && (
                <p className="mt-2 text-[11px] text-black/60 sm:hidden">
                  {t("আপনার কোড:", "Your code:")}{" "}
                  <span className="font-bold text-black">{referralCode}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs / Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
          {sections.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => toggleSection(item.id)}
                className={`
                  group relative px-3 sm:px-4 py-2 rounded-full text-left font-semibold transition-all duration-300
                  border border-black/10 hover:border-black/20 text-[13px] sm:text-[14px]
                  ${
                    isActive
                      ? "bg-[#f5c400] text-black shadow-[0_8px_16px_rgba(245,196,0,0.22)]"
                      : "bg-[#efefef] text-black/70 hover:text-black hover:bg-[#e5e5e5]"
                  }
                `}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="whitespace-nowrap">{item.name}</span>
                </div>

                {/* Shine effect */}
                <div
                  className={`
                    absolute inset-0 rounded-full bg-gradient-to-br from-white/25 to-transparent opacity-0
                    group-hover:opacity-60 transition-opacity duration-500 pointer-events-none
                    ${isActive ? "opacity-50" : ""}
                  `}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-5 sm:mt-6">
        {activeSection ? (
          <div className="bg-white rounded-xl border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.06)] overflow-hidden">
            {sections.find((s) => s.id === activeSection)?.component}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-black/10 p-6 shadow-[0_1px_0_rgba(0,0,0,0.06)] text-center">
            <h2 className="text-[17px] sm:text-[18px] font-extrabold text-black mb-3">
              {t("একটি ট্যাব নির্বাচন করুন", "Select a Tab")}
            </h2>
            <p className="text-[13px] text-black/60 max-w-md mx-auto">
              {t(
                "উপরের যেকোনো বাটনে ক্লিক করে রেফারেল সেকশনের বিস্তারিত দেখুন।",
                "Click any button above to view the referral section details.",
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referral;
