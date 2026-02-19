// src/components/ProfileNavbar/ProfileNavbar.jsx
import React, { useMemo } from "react";
import { NavLink, Outlet } from "react-router";
import { toast } from "react-toastify";
import {
  FaUserCircle,
  FaCrown,
  FaWallet,
  FaCopy,
  FaCoins,
} from "react-icons/fa";

// Redux
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import { useLanguage } from "../../Context/LanguageProvider";

// ✅ React Query + api
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

// ✅ fetch referral wallet balance (referCommissionBalance)
const fetchMyReferralWallet = async () => {
  // this endpoint we created: GET /api/users/me/referrals
  const { data } = await api.get("/api/users/me/referrals");
  // data.user.referCommissionBalance
  return data?.user || {};
};

const ProfileNavbar = () => {
  const { isBangla } = useLanguage();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Safe fallback if not logged in / user not loaded
  const username = user?.username || "Guest";
  const referralCode = user?.referralCode || "";

  const t = (bangla, english) => (isBangla ? bangla : english);

  const items = useMemo(
    () => [
      { label: t("ডিপোজিট", "Deposit"), to: "/profile/deposit" },
      { label: t("উত্তোলন", "Withdrawal"), to: "/profile/withdraw" },
      { label: t("ভাউচার", "Voucher"), to: "/profile/voucher" },
      { label: t("ইতিহাস", "History"), to: "/profile/history" },
      { label: t("আমার প্রোফাইল", "My Profile"), to: "/profile/me" },
      { label: t("ব্যাংকের তথ্য", "Bank Details"), to: "/profile/bank" },
      { label: t("পাসওয়ার্ড", "Password"), to: "/profile/password" },
      { label: t("ইনবক্স", "Inbox"), to: "/profile/inbox" },
      { label: t("রেফারেল", "Referral"), to: "/profile/referral" },
      { label: t("ভিআইপি", "VIP"), to: "/profile/vip" },
      {
        label: t("হুইল অফ ফরচুন", "Wheel Of Fortune"),
        to: "/profile/wheel-of-fortune",
      },
      { label: t("রিওয়ার্ডস", "Rewards"), to: "/profile/rewards" },
    ],
    [isBangla],
  );

  // ✅ Load referral wallet from server (referCommissionBalance)
  const {
    data: meReferral,
    isFetching: walletFetching,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ["me-referral-wallet"],
    queryFn: fetchMyReferralWallet,
    enabled: !!isAuthenticated,
    staleTime: 15_000,
    retry: 1,
  });

  const referralWallet = Number(meReferral?.referCommissionBalance || 0);
  const currency = meReferral?.currency || user?.currency || "BDT";
  const currencySymbol = currency === "USDT" ? "USDT" : "৳";

  // You can add real reward coins later
  const rewardCoins = 0;

  const handleCopy = async () => {
    if (!referralCode) return;

    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success(t("কপি হয়েছে!", "Copied!"));
    } catch (e) {
      // fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = referralCode;
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

  const cardCls =
    "bg-white rounded-xl border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.06)]";
  const softInput =
    "w-full bg-black/5 border border-black/5 rounded-lg px-3 py-3 text-[14px] outline-none";
  const yellowBtn =
    "w-full bg-[#f5c400] hover:bg-[#e7b900] text-black font-extrabold rounded-full py-3 text-[13px] transition";
  const blueBtn =
    "w-full bg-[#0b7cff] hover:bg-[#0a6fe6] text-white font-extrabold rounded-lg py-3 text-[13px] transition";

  if (!isAuthenticated) {
    return (
      <div className="p-10 text-center">{t("লগইন করুন", "Please log in")}</div>
    );
  }

  return (
    <div className="w-full">
      {/* Top Navbar (Desktop/Laptop only) */}
      <div className="hidden md:block">
        <div className="w-full max-w-[1500px] mx-auto py-6">
          <div className="bg-white rounded-xl px-4 py-4 shadow-[0_1px_0_rgba(0,0,0,0.06)] border border-black/5">
            <nav className="flex items-center gap-4">
              <div className="flex items-center justify-start gap-12 w-full overflow-x-auto scrollbar-none">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      [
                        "whitespace-nowrap text-[16px] font-medium",
                        "transition-colors duration-150",
                        isActive
                          ? "bg-[#f5c400] text-black px-4 py-2 rounded-full font-semibold"
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

      {/* Main Content: Sidebar + Outlet */}
      <div className="w-full max-w-[1500px] mx-auto pb-10">
        <div className="flex gap-6">
          {/* Left Sidebar (Desktop only) */}
          <aside className="hidden md:block w-[320px] shrink-0">
            <div className="space-y-4">
              {/* Welcome Card */}
              <div className={`${cardCls} p-4`}>
                <h3 className="text-[14px] font-extrabold text-black mb-3">
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

                {/* Betting Pass – placeholder */}
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
                    <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                      <div className="h-full w-[0%] bg-black/30" />
                    </div>
                    <div className="mt-1 text-[11px] font-semibold text-black/60">
                      0 / 200.00
                    </div>
                  </div>
                </div>

                {/* VIP Section – placeholder */}
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
                    <div className="mt-1 h-2 rounded-full bg-black/10 overflow-hidden">
                      <div className="h-full w-[0%] bg-black/30" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reward Coins */}
              <div className={`${cardCls} p-4`}>
                <div className="flex items-center gap-2 text-[13px] font-extrabold text-black">
                  <FaCoins className="text-black/60" />
                  {t("রিওয়ার্ড কয়েন", "Reward Coins")}
                </div>
                <div className="mt-1 text-[#0b66ff] font-extrabold text-[14px]">
                  {rewardCoins}
                </div>

                <button className={`${yellowBtn} mt-3`}>
                  {t("রিওয়ার্ডে যান", "GO TO REWARDS")}
                </button>
              </div>

              {/* ✅ Referral Wallet (real referCommissionBalance) */}
              <div className={`${cardCls} p-4`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[13px] font-extrabold text-black">
                    <FaWallet className="text-black/60" />
                    {t("রেফারেল ওয়ালেট", "Referral Wallet")}
                  </div>

                  {/* tiny refresh indicator */}
                  <button
                    type="button"
                    onClick={refetchWallet}
                    className="text-[11px] font-bold text-black/50 hover:text-black/80"
                    title="Refresh"
                    disabled={walletFetching}
                  >
                    {walletFetching
                      ? t("লোড...", "Loading...")
                      : t("রিফ্রেশ", "Refresh")}
                  </button>
                </div>

                <div className="mt-1 text-[#0b66ff] font-extrabold text-[14px]">
                  {currencySymbol} {referralWallet.toFixed(2)}
                </div>

                <button className={`${yellowBtn} mt-3`}>
                  {t("রিডিম করুন", "REDEEM")}
                </button>

                <p className="mt-3 text-[11px] leading-snug text-black/60">
                  {t(
                    "আমাদের এক্সক্লুসিভ রেফারেল প্রোগ্রামের মাধ্যমে আপনার বন্ধুদের আমন্ত্রণ জানিয়ে অতিরিক্ত টাকা আয় করুন",
                    "Earn extra cash with our exclusive referral program by inviting your friends to sign up using your referral code",
                  )}
                </p>

                {/* Referral code + Copy */}
                {referralCode && (
                  <div className="mt-3">
                    <div className="bg-black/10 rounded-lg px-3 py-3 text-[13px] font-extrabold text-[#0b66ff] break-all">
                      {referralCode}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`${blueBtn} mt-2 flex items-center justify-center gap-2`}
                    >
                      <FaCopy />
                      {t("কোড কপি করুন", "Copy Code")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right Side – Page Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfileNavbar;
