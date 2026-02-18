// src/pages/Profile/Referral/MyReferrals.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { FaCopy, FaShareAlt, FaUser, FaUserTie } from "react-icons/fa";
import { toast } from "react-toastify";
import { selectIsAuthenticated, selectUser } from "../../features/auth/authSelectors";
import { useLanguage } from "../../Context/LanguageProvider";



const MyReferrals = () => {
  const { isBangla } = useLanguage();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const referralCode = user?.referralCode || "";
  const username = user?.username || "Guest";

  const referralLink = useMemo(
    () => (referralCode ? `https://babu88.gold?refer_code=${referralCode}` : ""),
    [referralCode]
  );

  const t = (bn, en) => (isBangla ? bn : en);

  // Placeholder values — replace with real API data later
  const tierTotals = {
    tier1: 0,
    tier2: 0,
    tier3: 0,
  };

  const bonus = {
    referralFreeBonus: "0.00",
    depositRequired: "0.00 / 0.00",
    turnoverRequired: "0.00 / 0.00",
  };

  const status = {
    friendsInvited: 0,
    completedInvitation: 0,
  };

  const copyText = async (text) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("কপি হয়েছে!", "Copied!"));
    } catch (e) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        toast.success(t("কপি হয়েছে!", "Copied!"));
      } catch {
        toast.error(t("কপি করা যায়নি", "Copy failed"));
      }
    }
  };

  const handleShare = async () => {
    if (!referralLink) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: t("রেফারেল লিঙ্ক", "Referral Link"),
          text: t("আমার রেফারেল লিঙ্ক দিয়ে জয়েন করুন", "Join using my referral link"),
          url: referralLink,
        });
      } else {
        await copyText(referralLink);
        toast.info(t("শেয়ার সমর্থিত নয়, লিঙ্ক কপি করা হয়েছে!", "Share not supported, link copied!"));
      }
    } catch {
      // user cancelled → silent ignore
    }
  };

  const card =
    "bg-white rounded-xl border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.06)]";
  const label = "text-[13px] font-bold text-black/80";
  const inputWrap = "relative";
  const input =
    "w-full bg-black/5 border border-black/5 rounded-lg px-4 py-3 text-[13px] font-semibold text-[#0b66ff] outline-none";
  const copyBtn =
    "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-9 rounded-lg bg-white border border-black/10 flex items-center justify-center text-[#0b66ff] hover:bg-black/5 transition";

  if (!isAuthenticated || !referralCode) {
    return (
      <div className="p-8 text-center text-black/60">
        {t("রেফারেল দেখতে লগইন করুন", "Please log in to view referral information.")}
      </div>
    );
  }

  return (
    <div className={`${card} p-5 sm:p-6`}>
      {/* Referral Code + Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <div className={label}>{t("আপনার রেফারেল কোড :", "Your Referral Code :")}</div>
          <div className={`${inputWrap} mt-2`}>
            <input className={input} value={referralCode} readOnly />
            <button
              type="button"
              className={copyBtn}
              onClick={() => copyText(referralCode)}
              aria-label="Copy referral code"
              title={t("কপি", "Copy")}
            >
              <FaCopy />
            </button>
          </div>
        </div>

        <div>
          <div className={label}>{t("রেফারেল লিঙ্ক", "Referral Link")}</div>
          <div className={`${inputWrap} mt-2`}>
            <input className={input} value={referralLink} readOnly />
            <button
              type="button"
              className={copyBtn}
              onClick={() => copyText(referralLink)}
              aria-label="Copy referral link"
              title={t("কপি", "Copy")}
            >
              <FaCopy />
            </button>
          </div>
        </div>
      </div>

      {/* Lifetime Commission Title */}
      <div className="mt-6 sm:mt-8">
        <div className="text-[18px] sm:text-[20px] font-extrabold text-black">
          {t("লাইফটাইম রেফারেল কমিশন", "LifeTime Referral Commission")}
        </div>
        <div className="mt-1 text-[13px] font-medium text-[#0b66ff]">
          {t(
            "আপনার বন্ধুরা প্রতিবার ডিপোজিট করলে আপনি অতিরিক্ত লাইফটাইম ডিপোজিট কমিশন পাবেন (সর্বোচ্চ ২%)।",
            "You also get to earn an additional lifetime deposit commission of up to 2% from your friends every time they make a deposit."
          )}
        </div>
      </div>

      {/* Tier Structure Diagram */}
      <div className="mt-6 sm:mt-8">
        <div className="relative">
          <div className="absolute left-[18px] top-[10px] bottom-[14px] w-[2px] bg-black/15" />

          {/* Self row */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative z-10 w-9 h-9 rounded-full bg-black flex items-center justify-center text-[#f5c400]">
              <FaUserTie />
            </div>
            <div className="h-[2px] w-10 bg-[#f5c400]" />
            <div className="flex items-center gap-3 flex-1 max-w-[520px]">
              <div className="flex-1 bg-[#3a3a3a] text-[#f5c400] font-extrabold text-[13px] rounded-md px-4 py-3.5 text-center shadow-[0_8px_16px_rgba(0,0,0,0.18)]">
                {username}
              </div>
              <div className="w-[110px] sm:w-[120px] bg-[#3a3a3a] text-white font-extrabold text-[13px] rounded-md px-3 py-3.5 text-center shadow-[0_8px_16px_rgba(0,0,0,0.18)]">
                {t("মোট", "Total")}
              </div>
            </div>
          </div>

          {/* Tier rows */}
          {[
            { label: t("লেভেল ১ (১%)", "Level 1 (1%)"), value: tierTotals.tier1 },
            { label: t("লেভেল ২ (০.৭%)", "Level 2 (0.7%)"), value: tierTotals.tier2 },
            { label: t("লেভেল ৩ (০.৩%)", "Level 3 (0.3%)"), value: tierTotals.tier3 },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-4 mb-5">
              <div className="relative z-10 w-9 h-9 rounded-full bg-[#d9d9d9] flex items-center justify-center text-black/60 border border-black/10">
                <FaUser />
              </div>
              <div className="h-[2px] w-10 bg-black/20" />
              <div className="flex items-center gap-3 flex-1 max-w-[520px]">
                <div className="flex-1 bg-[#e7e7e7] text-black font-bold text-[13px] rounded-md px-4 py-3.5 text-center border border-black/10 shadow-[0_6px_14px_rgba(0,0,0,0.12)]">
                  {t.label}
                </div>
                <div className="w-[110px] sm:w-[120px] bg-[#e7e7e7] text-black font-extrabold text-[13px] rounded-md px-3 py-3.5 text-center border border-black/10 shadow-[0_6px_14px_rgba(0,0,0,0.12)]">
                  {t.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleShare}
            disabled={!referralLink}
            className="w-full max-w-[380px] bg-[#0b8cff] hover:bg-[#0a7ee6] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-extrabold rounded-lg py-3.5 text-[13.5px] flex items-center justify-center gap-2.5 transition"
          >
            {t("বন্ধুদের আমন্ত্রণ জানান", "Invite Friends")} <FaShareAlt />
          </button>
        </div>
      </div>

      {/* Referral Bonus & Status */}
      <div className="mt-8 sm:mt-10">
        <div className="text-[15px] sm:text-[16px] font-extrabold text-black mb-4">
          {t("রেফারেল বোনাস", "Referral Bonus")}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bonus requirements */}
          <div className="space-y-5">
            <div>
              <div className="text-[13px] font-bold text-black">
                {t("রেফারেল ফ্রি বোনাস", "Referral Free Bonus")}
              </div>
              <div className="mt-2 bg-black/5 rounded-lg px-4 py-3.5 text-[13.5px] font-extrabold text-[#0b66ff]">
                {bonus.referralFreeBonus} ৳
              </div>
            </div>

            <div>
              <div className="text-[13px] font-bold text-black">
                {t("ডিপোজিট প্রয়োজন", "Deposit Required")}
              </div>
              <div className="mt-2 bg-black/5 rounded-lg px-4 py-3.5 text-[13.5px] font-extrabold text-[#0b66ff]">
                {bonus.depositRequired}
              </div>
            </div>

            <div>
              <div className="text-[13px] font-bold text-black">
                {t("টার্নওভার প্রয়োজন", "Turnover Required")}
              </div>
              <div className="mt-2 bg-black/5 rounded-lg px-4 py-3.5 text-[13.5px] font-extrabold text-[#0b66ff]">
                {bonus.turnoverRequired}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="text-[13px] font-bold text-black mb-3">
              {t("আপনার রেফারেল স্ট্যাটাস", "Your Referral Status")}
            </div>

            <div className="bg-black/8 rounded-xl border border-black/10 overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="p-5 bg-black/5">
                  <div className="text-center text-[12.5px] font-semibold text-black/70">
                    {t("আমন্ত্রিত বন্ধু", "Friends Invited")}
                  </div>
                  <div className="mt-3 text-center text-[40px] sm:text-[44px] font-light text-black/60">
                    {status.friendsInvited}
                  </div>
                </div>

                <div className="p-5 bg-black/5 border-l border-black/15">
                  <div className="text-center text-[12.5px] font-semibold text-black/70">
                    {t("সম্পন্ন আমন্ত্রণ", "Completed Invitation")}
                  </div>
                  <div className="mt-3 text-center text-[40px] sm:text-[44px] font-extrabold text-[#0b66ff]">
                    {status.completedInvitation}
                  </div>
                </div>
              </div>

              {/* Placeholder for chart / illustration */}
              <div className="h-[160px] sm:h-[170px] bg-black/5" />
            </div>
          </div>
        </div>

        <div className="mt-6 text-[12.5px] leading-relaxed font-medium text-[#0b66ff]">
          {t(
            "সম্পন্ন আমন্ত্রণ থাকলে সদস্যরা ফ্রি ৳৫০০ এর জন্য আবেদন করতে পারবেন। যাচাই সফল হলে বোনাস স্বয়ংক্রিয়ভাবে রেফারেল ওয়ালেটে যোগ হবে।",
            "Members can apply for their free ৳500 if there is completed invitation. Bonus will be automatically credited to Referral Wallet upon successful verification."
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReferrals;