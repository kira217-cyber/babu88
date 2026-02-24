// src/pages/Profile/Referral/MyReferrals.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FaCopy, FaShareAlt, FaUser, FaUserTie } from "react-icons/fa";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";
import { api } from "../../api/axios";
import RedeemModal from "../../components/RedeemModal/RedeemModal";

const fetchMyReferralInfo = async () => {
  const { data } = await api.get("/api/users/me/referrals");
  return data;
};

// fallback default tiers (client side display only)
const DEFAULT_TIERS = [
  { from: 1, to: 10, amount: 0, label: "Level 1 - 10", isActive: true },
  { from: 11, to: 30, amount: 0, label: "Level 2 - 20", isActive: true },
  { from: 31, to: 60, amount: 0, label: "Level 3 - 30", isActive: true },
];

const MyReferrals = () => {
  const { isBangla } = useLanguage();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [redeemOpen, setRedeemOpen] = useState(false);

  const t = (bn, en) => (isBangla ? bn : en);

  // ✅ keep refetch so modal success can refresh
  const {
    data,
    isLoading,
    isError,
    refetch: refetchWallet,
    isFetching,
  } = useQuery({
    queryKey: ["me-referrals"],
    queryFn: fetchMyReferralInfo,
    enabled: !!isAuthenticated,
    staleTime: 15_000,
    retry: 1,
  });

  const me = data?.user || null;

  const referralCode = me?.referralCode || "";
  const username = me?.username || "Guest";
  const referralCount = Number(me?.referralCount || 0);
  const referCommissionBalance = Number(me?.referCommissionBalance || 0);

  const tiers = useMemo(() => {
    const override = me?.referralTierOverride;
    if (Array.isArray(override) && override.length > 0) {
      return override.map((x) => ({
        from: Number(x.from || 1),
        to: Number(x.to || 1),
        amount: Number(x.amount || 0),
        label: String(x.label || ""),
        isActive: typeof x.isActive === "boolean" ? x.isActive : true,
      }));
    }
    return DEFAULT_TIERS;
  }, [me?.referralTierOverride]);

  const referralLink = useMemo(() => {
    if (!referralCode) return "";
    return `${import.meta.env.VITE_CLIENT_URL}/register?ref=${referralCode}`;
  }, [referralCode]);

  // ✅ Count per tier based on referralCount and tier range
  const tierCounts = useMemo(() => {
    return tiers.map((tr) => {
      const from = Number(tr.from);
      const to = Number(tr.to);
      if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
      if (referralCount < from) return 0;
      const end = Math.min(referralCount, to);
      return Math.max(0, end - from + 1);
    });
  }, [tiers, referralCount]);

  const currencySymbol = me?.currency === "USDT" ? "USDT" : "৳";
  const referralWallet = referCommissionBalance; // ✅ used for RedeemModal

  const bonus = useMemo(() => {
    return {
      referralFreeBonus: referCommissionBalance.toFixed(2),
      depositRequired: "0.00 / 0.00",
      turnoverRequired: "0.00 / 0.00",
      currencySymbol,
    };
  }, [referCommissionBalance, currencySymbol]);

  const status = useMemo(
    () => ({
      friendsInvited: referralCount,
      completedInvitation: 0, // ✅ later: your business logic/API
    }),
    [referralCount],
  );

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
          text: t(
            "আমার রেফারেল লিঙ্ক দিয়ে জয়েন করুন",
            "Join using my referral link",
          ),
          url: referralLink,
        });
      } else {
        await copyText(referralLink);
        toast.info(
          t(
            "শেয়ার সমর্থিত নয়, লিঙ্ক কপি করা হয়েছে!",
            "Share not supported, link copied!",
          ),
        );
      }
    } catch {
      // cancelled
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

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center text-black/60">
        {t(
          "রেফারেল দেখতে লগইন করুন",
          "Please log in to view referral information.",
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${card} p-6 text-center text-black/60`}>
        {t("লোড হচ্ছে...", "Loading...")}
      </div>
    );
  }

  if (isError || !me || !referralCode) {
    return (
      <div className="p-8 text-center text-black/60">
        {t("রেফারেল তথ্য পাওয়া যায়নি", "Referral info not found")}
      </div>
    );
  }

  return (
    <div className={`${card} p-5 sm:p-6`}>
      {/* Referral Code + Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <div className={label}>
            {t("আপনার রেফারেল কোড :", "Your Referral Code :")}
          </div>
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
            "You also get to earn an additional lifetime deposit commission of up to 2% from your friends every time they make a deposit.",
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
          {tiers.map((tr, idx) => {
            const from = Number(tr.from);
            const to = Number(tr.to);
            const amount = Number(tr.amount || 0);
            const active = tr.isActive !== false;

            const bnLabel =
              tr.label?.trim() ||
              `লেভেল ${idx + 1} - ${from} থেকে ${to} (প্রতি ইউজার ${amount} %)`;
            const enLabel =
              tr.label?.trim() ||
              `Level ${idx + 1} - ${from} to ${to} (per user ${amount} %)`;

            return (
              <div
                key={`${from}-${to}-${idx}`}
                className="flex items-center gap-4 mb-5"
              >
                <div
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border ${
                    active
                      ? "bg-[#d9d9d9] text-black/60 border-black/10"
                      : "bg-[#f3f3f3] text-black/30 border-black/10"
                  }`}
                  title={active ? "Active" : "Inactive"}
                >
                  <FaUser />
                </div>
                <div className="h-[2px] w-10 bg-black/20" />
                <div className="flex items-center gap-3 flex-1 max-w-[520px]">
                  <div className="flex-1 bg-[#e7e7e7] text-black font-bold text-[13px] rounded-md px-4 py-3.5 text-center border border-black/10 shadow-[0_6px_14px_rgba(0,0,0,0.12)]">
                    {t(bnLabel, enLabel)}
                  </div>
                  <div className="w-[110px] sm:w-[120px] bg-[#e7e7e7] text-black font-extrabold text-[13px] rounded-md px-3 py-3.5 text-center border border-black/10 shadow-[0_6px_14px_rgba(0,0,0,0.12)]">
                    {tierCounts[idx] || 0}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Invite friends */}
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

        {/* ✅ Mobile Redeem button -> opens RedeemModal */}
        <div className="mt-6 block md:hidden">
          <button
            type="button"
            onClick={() => setRedeemOpen(true)}
            className="w-full max-w-[380px] bg-[#f5c400] hover:bg-[#e7b900] disabled:bg-gray-400 disabled:cursor-not-allowed text-black font-extrabold rounded-lg py-3.5 text-[13.5px] flex items-center justify-center gap-2.5 transition"
          >
            {t("রিডিম করুন!", "Redeem Now!")}
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
                {bonus.referralFreeBonus} {bonus.currencySymbol}
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

              <div className="h-[160px] sm:h-[170px] bg-black/5" />
            </div>
          </div>
        </div>

        <div className="mt-6 text-[12.5px] leading-relaxed font-medium text-[#0b66ff]">
          {t(
            "সম্পন্ন আমন্ত্রণ থাকলে সদস্যরা ফ্রি ৳৫০০ এর জন্য আবেদন করতে পারবেন। যাচাই সফল হলে বোনাস স্বয়ংক্রিয়ভাবে রেফারেল ওয়ালেটে যোগ হবে।",
            "Members can apply for their free ৳500 if there is completed invitation. Bonus will be automatically credited to Referral Wallet upon successful verification.",
          )}
        </div>
      </div>

      {/* ✅ Redeem Modal (same behavior as ProfileNavbar) */}
      <RedeemModal
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        referralWallet={referralWallet}
        currencySymbol={currencySymbol === "USDT" ? "USDT" : "৳"}
        onSuccess={() => {
          // ✅ refresh referral wallet number after redeem
          refetchWallet?.();
        }}
      />
    </div>
  );
};

export default MyReferrals;
