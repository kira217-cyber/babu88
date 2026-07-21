// src/components/ProfileNavbar/ProfileNavbar.jsx

import React, { useMemo, useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { toast } from "react-toastify";
import {
  FaCoins,
  FaCopy,
  FaCrown,
  FaUserCircle,
  FaWallet,
} from "react-icons/fa";

import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";

import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import RedeemModal from "../RedeemModal/RedeemModal";

/* ======================================================
   FETCH REFERRAL WALLET
====================================================== */

const fetchMyReferralWallet = async () => {
  const { data } = await api.get("/api/users/me/referrals");

  return data?.user || {};
};

/* ======================================================
   FETCH REAL REWARD COIN
====================================================== */

const fetchMyRewardCoin = async () => {
  const { data } = await api.get("/api/check-in-reward");

  return data || {};
};

const ProfileNavbar = () => {
  const { isBangla } = useLanguage();

  const user = useSelector(selectUser);

  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [redeemOpen, setRedeemOpen] = useState(false);

  const username = user?.username || "Guest";

  const referralCode = user?.referralCode || "";

  const t = (bangla, english) => (isBangla ? bangla : english);

  const items = useMemo(
    () => [
      {
        label: t("ডিপোজিট", "Deposit"),
        to: "/profile/deposit",
      },
      {
        label: t("অটো ডিপোজিট", "Auto Deposit"),
        to: "/profile/auto-deposit",
      },
      {
        label: t("উত্তোলন", "Withdrawal"),
        to: "/profile/withdraw",
      },
      {
        label: t("ইতিহাস", "History"),
        to: "/profile/history",
      },
      {
        label: t("প্রোফাইল", "My Profile"),
        to: "/profile/me",
      },
      {
        label: t("ইনবক্স", "Inbox"),
        to: "/profile/inbox",
      },
      {
        label: t("রেফারেল", "Referral"),
        to: "/profile/referral",
      },
      {
        label: t("ভিআইপি", "VIP"),
        to: "/profile/vip",
      },
      {
        label: t("রিওয়ার্ডস", "Rewards"),
        to: "/profile/reward",
      },
    ],
    [isBangla],
  );

  /* ====================================================
     REAL REFERRAL WALLET
  ==================================================== */

  const {
    data: meReferral,
    isFetching: walletFetching,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ["me-referral-wallet"],
    queryFn: fetchMyReferralWallet,
    enabled: Boolean(isAuthenticated),
    staleTime: 15_000,
    retry: 1,
  });

  const referralWallet = Number(meReferral?.referCommissionBalance || 0);

  const currency = meReferral?.currency || user?.currency || "BDT";

  const currencySymbol = currency === "USDT" ? "USDT" : "৳";

  /* ====================================================
     REAL REWARD COIN
  ==================================================== */

  const {
    data: checkInData,
    isFetching: rewardCoinFetching,
    refetch: refetchRewardCoin,
  } = useQuery({
    queryKey: ["my-check-in-reward-coin"],
    queryFn: fetchMyRewardCoin,
    enabled: Boolean(isAuthenticated),
    staleTime: 0,
    retry: 1,
    refetchOnWindowFocus: true,
  });

  const rewardCoins = Number(checkInData?.user?.rewardCoin || 0);

  /* ====================================================
     REFERRAL LINK
  ==================================================== */

  const referralLink = useMemo(() => {
    if (!referralCode) return "";

    const clientUrl = String(import.meta.env.VITE_CLIENT_URL || "").replace(
      /\/+$/,
      "",
    );

    return `${clientUrl}/register?ref=${referralCode}`;
  }, [referralCode]);

  const handleCopy = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);

      toast.success(t("রেফারেল লিংক কপি হয়েছে!", "Referral link copied!"));
    } catch {
      try {
        const textarea = document.createElement("textarea");

        textarea.value = referralLink;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        document.execCommand("copy");
        document.body.removeChild(textarea);

        toast.success(t("রেফারেল লিংক কপি হয়েছে!", "Referral link copied!"));
      } catch {
        toast.error(
          t("রেফারেল লিংক কপি করা যায়নি", "Failed to copy referral link"),
        );
      }
    }
  };

  const cardCls =
    "bg-white rounded-xl border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.06)]";

  const softInput =
    "w-full bg-black/5 border border-black/5 rounded-lg px-3 py-3 text-[14px] outline-none";

  const yellowBtn =
    "w-full cursor-pointer bg-[#f5c400] hover:bg-[#e7b900] text-black font-extrabold rounded-full py-3 text-[13px] text-center transition";

  const blueBtn =
    "w-full cursor-pointer bg-[#0b7cff] hover:bg-[#0a6fe6] text-white font-extrabold rounded-lg py-3 text-[13px] transition";

  if (!isAuthenticated) {
    return (
      <div className="p-10 text-center">{t("লগইন করুন", "Please log in")}</div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop navigation */}
      <div className="hidden md:block">
        <div className="mx-auto w-full max-w-[1500px] py-6">
          <div className="rounded-xl border border-black/5 bg-white px-4 py-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
            <nav className="flex items-center gap-4">
              <div className="scrollbar-none flex w-full items-center justify-start gap-12 overflow-x-auto">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      [
                        "cursor-pointer whitespace-nowrap text-[16px] font-medium",
                        "transition-colors duration-150",

                        isActive
                          ? "rounded-full bg-[#f5c400] px-4 py-2 font-semibold text-black"
                          : "text-black/90 hover:text-black",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto w-full max-w-[1500px] pb-10">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden w-[320px] shrink-0 md:block">
            <div className="space-y-4">
              {/* Welcome card */}
              <div className={`${cardCls} p-4`}>
                <h3 className="mb-3 text-[14px] font-extrabold text-black">
                  {t("স্বাগতম!", "Welcome back!")}
                </h3>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
                    <FaUserCircle />
                  </span>

                  <input
                    className={`${softInput} pl-10`}
                    value={username}
                    readOnly
                  />
                </div>

                {/* Betting Pass */}
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2 text-[12px] font-bold text-black/70">
                    <FaCrown className="text-black/50" />

                    <span>
                      {t("বেটিং পাস", "Betting Pass")}{" "}
                      <span className="text-[#0b66ff]">
                        {t("লেভেল ১", "Level 1")}
                      </span>
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="h-2 overflow-hidden rounded-full bg-black/10">
                      <div className="h-full w-[0%] bg-black/30" />
                    </div>

                    <div className="mt-1 text-[11px] font-semibold text-black/60">
                      0 / 200.00
                    </div>
                  </div>
                </div>

                {/* VIP */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-[12px] font-extrabold text-[#0b66ff]">
                    <FaCrown className="text-[#0b66ff]" />
                    VIP MEMBER
                  </div>

                  <div className="mt-2 text-[11px] font-semibold text-black/60">
                    {t("ডিপোজিট :", "Deposit :")} {t("সম্পন্ন", "Completed")}
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-black/60">
                      <span>{t("টার্নওভার :", "Turnover :")}</span>

                      <span>0 / 180,000</span>
                    </div>

                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/10">
                      <div className="h-full w-[0%] bg-black/30" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Real Reward Coins */}
              <div className={`${cardCls} p-4`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[13px] font-extrabold text-black">
                    <FaCoins className="text-black/60" />

                    {t("রিওয়ার্ড কয়েন", "Reward Coins")}
                  </div>

                  <button
                    type="button"
                    onClick={() => refetchRewardCoin()}
                    disabled={rewardCoinFetching}
                    className={`text-[11px] font-bold transition ${
                      rewardCoinFetching
                        ? "cursor-not-allowed text-black/30"
                        : "cursor-pointer text-black/50 hover:text-black/80"
                    }`}
                  >
                    {rewardCoinFetching
                      ? t("লোড...", "Loading...")
                      : t("রিফ্রেশ", "Refresh")}
                  </button>
                </div>

                <div className="mt-1 text-[14px] font-extrabold text-[#0b66ff]">
                  {rewardCoinFetching && !checkInData
                    ? t("লোড হচ্ছে...", "Loading...")
                    : Number(rewardCoins).toLocaleString(
                        isBangla ? "bn-BD" : "en-BD",
                        {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        },
                      )}
                </div>

                <Link
                  to="/profile/reward/check-in"
                  className={`${yellowBtn} mt-3 block`}
                >
                  {t("রিওয়ার্ডে যান", "GO TO REWARDS")}
                </Link>
              </div>

              {/* Referral wallet */}
              <div className={`${cardCls} p-4`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[13px] font-extrabold text-black">
                    <FaWallet className="text-black/60" />

                    {t("রেফারেল ওয়ালেট", "Referral Wallet")}
                  </div>

                  <button
                    type="button"
                    onClick={() => refetchWallet()}
                    className={`text-[11px] font-bold transition ${
                      walletFetching
                        ? "cursor-not-allowed text-black/30"
                        : "cursor-pointer text-black/50 hover:text-black/80"
                    }`}
                    title="Refresh"
                    disabled={walletFetching}
                  >
                    {walletFetching
                      ? t("লোড...", "Loading...")
                      : t("রিফ্রেশ", "Refresh")}
                  </button>
                </div>

                <div className="mt-1 text-[14px] font-extrabold text-[#0b66ff]">
                  {currencySymbol} {referralWallet.toFixed(2)}
                </div>

                <button
                  type="button"
                  onClick={() => setRedeemOpen(true)}
                  className={`${yellowBtn} mt-3`}
                >
                  {t("রিডিম করুন", "REDEEM")}
                </button>

                <p className="mt-3 text-[11px] leading-snug text-black/60">
                  {t(
                    "আমাদের এক্সক্লুসিভ রেফারেল প্রোগ্রামের মাধ্যমে আপনার বন্ধুদের আমন্ত্রণ জানিয়ে অতিরিক্ত টাকা আয় করুন",
                    "Earn extra cash with our exclusive referral program by inviting your friends to sign up using your referral link",
                  )}
                </p>

                {/* Referral link and copy */}
                {referralLink && (
                  <div className="mt-3">
                    <div className="break-all rounded-lg bg-black/10 px-3 py-3 text-[12px] font-extrabold text-[#0b66ff]">
                      {referralLink}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`${blueBtn} mt-2 flex items-center justify-center gap-2`}
                    >
                      <FaCopy />

                      {t("রেফারেল লিংক কপি করুন", "Copy Referral Link")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Page content */}
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      <RedeemModal
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        referralWallet={referralWallet}
        currencySymbol={currencySymbol === "USDT" ? "USDT" : "৳"}
        onSuccess={() => {
          refetchWallet?.();
        }}
      />
    </div>
  );
};

export default ProfileNavbar;
