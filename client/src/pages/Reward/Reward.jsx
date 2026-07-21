// src/pages/Reward/Reward.jsx
import { Link, NavLink, Outlet } from "react-router";
import {
  CalendarCheck,
  CircleDollarSign,
  Gift,
  History,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../../api/axios";
import { selectAuth } from "../../features/auth/authSelectors";

const REWARD_BANNER =
  "https://babu88.gold/static/image/referral/reward_banner_desktop.jpg";

const Reward = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const auth = useSelector(selectAuth);
  const token = auth?.token;

  const [rewardPoints, setRewardPoints] = useState(0);

  useEffect(() => {
    const loadRewardCoin = async () => {
      if (!token) {
        setRewardPoints(0);
        return;
      }

      try {
        const { data } = await api.get("/api/check-in-reward", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRewardPoints(Number(data?.user?.rewardCoin || 0));
      } catch (error) {
        console.error("Reward Coin fetch error:", error);

        setRewardPoints(0);
      }
    };

    loadRewardCoin();
  }, [token]);

  // পরে API/Redux থেকে reward points নিতে পারবেন
  // const rewardPoints = 2;

  const navItems = [
    {
      name: t("রিওয়ার্ড স্টোর", "Reward Store"),
      path: "reward-store",
      icon: Gift,
    },
    {
      name: t("চেক ইন", "Check In"),
      path: "check-in",
      icon: CalendarCheck,
    },
    {
      name: t("হুইল অফ ফরচুন", "Wheel of Fortune"),
      path: "/wheel-of-fortune",
      icon: Trophy,
    },
  ];

  return (
    <div className="w-full">
      {/* Header section */}
      <div className="rounded-xl border border-black/10 bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.06)] sm:p-4">
        {/* Banner */}
        <div className="relative min-h-[145px] overflow-hidden rounded-xl sm:min-h-[160px]">
          <img
            src={REWARD_BANNER}
            alt={t("রিওয়ার্ড ব্যানার", "Reward banner")}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Overlay for readable text */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent sm:from-black/75 sm:via-black/25" />

          {/* Banner text */}
          <div className="relative z-10 flex min-h-[145px] items-center p-5 sm:min-h-[160px] sm:p-7">
            <div className="max-w-[650px]">
              <h1 className="text-[24px] font-extrabold leading-tight text-white drop-shadow-md sm:text-[28px]">
                {t("পুরস্কার", "Rewards")}
              </h1>

              <p className="mt-2 max-w-[630px] text-[12px] font-medium leading-5 text-white sm:text-[14px] sm:leading-6">
                {t(
                  "প্রতিবার জয় করার সময় পুরস্কারের কয়েন সংগ্রহ করুন! আপনি রিওয়ার্ড স্টোর থেকে আকর্ষণীয় পুরস্কার নিতে পারবেন এবং ভাগ্যবান পুরস্কার জেতার সুযোগের জন্য ভাগ্যের চাকা ঘুরাতে পারবেন!",
                  "Collect reward coins every time you win! Redeem exciting prizes from the Reward Store and spin the Wheel of Fortune for a chance to win special rewards!",
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Reward balance and history */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Reward points */}
          <div className="flex h-[43px] w-full overflow-hidden rounded-sm border border-black/20 bg-white sm:w-[280px]">
            <div className="flex w-[68px] shrink-0 items-center justify-center bg-[#ffc800]">
              <CircleDollarSign size={21} strokeWidth={2.3} />
            </div>

            <div className="flex flex-1 items-center px-3 text-[15px] font-medium text-black">
              {Number(rewardPoints).toLocaleString(
                isBangla ? "bn-BD" : "en-BD",
              )}
            </div>
          </div>

          {/* Reward history */}
          <Link
            to="/profile/history"
            className="flex cursor-pointer items-center justify-end gap-1 self-end text-[14px] font-medium text-[#1683eb] transition-colors hover:text-[#006bc7] sm:text-[15px]"
          >
            <History size={17} />

            <span>{t("পুরস্কারের ইতিহাস", "Reward History")}</span>

            <ChevronRight size={17} />
          </Link>
        </div>

        {/* Navigation links */}
        <div className="mt-3 grid grid-cols-2 md:flex items-center gap-2 pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 sm:px-5 sm:text-[14px] ${
                    isActive
                      ? "bg-[#ffc800] text-black shadow-sm"
                      : "bg-[#f1f1f1] text-black/50 hover:bg-[#e6e6e6] hover:text-black/75"
                  }`
                }
              >
                <Icon size={19} strokeWidth={1.8} />

                <span className="whitespace-nowrap">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Selected child page */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Reward;
