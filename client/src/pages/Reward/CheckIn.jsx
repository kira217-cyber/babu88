// src/pages/Reward/CheckIn.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  FaCheck,
  FaClock,
  FaCoins,
  FaGift,
  FaLock,
  FaSyncAlt,
  FaTrophy,
  FaWallet,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";

import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectAuth,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";

const CheckIn = () => {
  const navigate = useNavigate();

  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const token = auth?.token;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [congratulation, setCongratulation] = useState(null);

  const requestConfig = useMemo(() => {
    if (!token) return {};

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const calculateRemainingSeconds = (nextClaimAt) => {
    if (!nextClaimAt) return 0;

    return Math.max(
      Math.ceil((new Date(nextClaimAt).getTime() - Date.now()) / 1000),
      0,
    );
  };

  const loadCheckInStatus = useCallback(async () => {
    if (!token) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/api/check-in-reward", requestConfig);

      const result = response?.data;

      setData(result);

      setRemainingSeconds(
        calculateRemainingSeconds(result?.progress?.nextClaimAt),
      );
    } catch (error) {
      setData(null);

      toast.error(
        error?.response?.data?.message ||
          t(
            "চেক-ইন তথ্য লোড করা যায়নি",
            "Failed to load Check-In information",
          ),
      );
    } finally {
      setLoading(false);
    }
  }, [token, requestConfig, isBangla]);

  useEffect(() => {
    loadCheckInStatus();
  }, [loadCheckInStatus]);

  /**
   * Live countdown timer.
   */
  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds > 0]);

  /**
   * Countdown শেষ হলে নতুন status load হবে।
   */
  useEffect(() => {
    if (remainingSeconds === 0 && data?.progress?.nextClaimAt) {
      const nextClaimTime = new Date(data.progress.nextClaimAt).getTime();

      if (Date.now() >= nextClaimTime) {
        setData((previous) => {
          if (!previous) return previous;

          return {
            ...previous,

            progress: {
              ...previous.progress,
              canClaim: previous.setting?.isActive === true,
            },

            days: previous.days?.map((day) => ({
              ...day,

              status: day.isCurrent ? "available" : day.status,

              canClaim: day.isCurrent,
            })),
          };
        });
      }
    }
  }, [remainingSeconds, data?.progress?.nextClaimAt, data?.setting?.isActive]);

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(Number(seconds || 0), 0);

    const hours = Math.floor(safeSeconds / 3600);

    const minutes = Math.floor((safeSeconds % 3600) / 60);

    const secs = safeSeconds % 60;

    return [hours, minutes, secs]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };

  const formatAmount = (amount, rewardType) => {
    if (rewardType === "reward_coin") {
      return `${Number(amount || 0).toLocaleString(
        isBangla ? "bn-BD" : "en-BD",
      )} ${t("কয়েন", "Coins")}`;
    }

    return `৳${Number(amount || 0).toLocaleString(
      isBangla ? "bn-BD" : "en-BD",
    )}`;
  };

  const getDayName = (day) => {
    return (
      (isBangla ? day?.dayName?.bn : day?.dayName?.en) ||
      day?.dayName?.en ||
      day?.dayName?.bn ||
      `${t("দিন", "Day")} ${day?.dayNumber || ""}`
    );
  };

  const currentDay = useMemo(() => {
    return data?.days?.find((day) => day.isCurrent);
  }, [data?.days]);

  const canClaim =
    Boolean(data?.progress?.canClaim) &&
    Boolean(data?.setting?.isActive) &&
    remainingSeconds <= 0 &&
    !claiming;

  const handleClaim = async () => {
    if (!isAuthenticated || !token) {
      toast.error(
        t("চেক-ইন করতে প্রথমে লগইন করুন", "Please log in before checking in"),
      );

      navigate("/login");
      return;
    }

    if (!canClaim) return;

    try {
      setClaiming(true);

      const response = await api.post(
        "/api/check-in-reward/claim",
        {},
        requestConfig,
      );

      const result = response?.data;

      setCongratulation({
        rewardType: result?.claimedDay?.rewardType,

        amount: result?.claimedDay?.amount,

        dayName: result?.claimedDay?.dayName,

        balanceAfter: result?.user?.balanceAfter,

        rewardCoinAfter: result?.user?.rewardCoinAfter,
      });

      toast.success(
        result?.message ||
          t(
            "দৈনিক পুরস্কার সফলভাবে পাওয়া গেছে",
            "Daily reward claimed successfully",
          ),
      );

      await loadCheckInStatus();
    } catch (error) {
      const result = error?.response?.data;

      if (result?.remainingTime) {
        setRemainingSeconds(Number(result.remainingTime.remainingSeconds || 0));
      }

      toast.error(
        result?.message ||
          t("পুরস্কার ক্লেইম করা যায়নি", "Failed to claim reward"),
      );
    } finally {
      setClaiming(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff2ad] text-3xl text-[#dca400]">
          <FaGift />
        </div>

        <h2 className="mt-4 text-xl font-extrabold text-black">
          {t(
            "দৈনিক পুরস্কার পেতে লগইন করুন",
            "Log in to collect daily rewards",
          )}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/55">
          {t(
            "প্রতিদিন লগইন করে Balance অথবা Reward Coin সংগ্রহ করুন।",
            "Log in every day and collect Balance or Reward Coins.",
          )}
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-5 cursor-pointer rounded-full bg-[#ffc800] px-8 py-3 text-sm font-extrabold text-black transition hover:bg-[#edba00] active:scale-95"
        >
          {t("লগইন করুন", "Login Now")}
        </button>
      </div>
    );
  }

  if (loading) {
    return <CheckInLoading />;
  }

  if (!data?.setting) {
    return (
      <div className="w-full rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <FaGift className="mx-auto text-5xl text-[#ffc800]" />

        <h2 className="mt-4 text-lg font-extrabold text-black">
          {t(
            "চেক-ইন রিওয়ার্ড পাওয়া যায়নি",
            "Check-In reward is not available",
          )}
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full mt-4">
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#fff3b4] via-[#ffd52d] to-[#ffc400] p-5 sm:p-7">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/25" />
          <div className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/20" />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-xl text-[#ffc800] shadow-lg">
                  <FaGift />
                </div>

                <div>
                  <h1 className="text-xl font-extrabold text-black sm:text-2xl">
                    {(isBangla
                      ? data.setting.title?.bn
                      : data.setting.title?.en) ||
                      t("দৈনিক চেক ইন", "Daily Check In")}
                  </h1>

                  <p className="mt-1 text-xs font-semibold text-black/65 sm:text-sm">
                    {(isBangla
                      ? data.setting.description?.bn
                      : data.setting.description?.en) ||
                      t(
                        "প্রতিদিন চেক ইন করে পুরস্কার সংগ্রহ করুন।",
                        "Check in daily and collect your reward.",
                      )}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-[270px]">
              <BalanceBox
                icon={<FaWallet />}
                label={t("ব্যালেন্স", "Balance")}
                value={`৳${Number(data.user?.balance || 0).toLocaleString(
                  isBangla ? "bn-BD" : "en-BD",
                )}`}
              />

              <BalanceBox
                icon={<FaCoins />}
                label={t("রিওয়ার্ড কয়েন", "Reward Coin")}
                value={Number(data.user?.rewardCoin || 0).toLocaleString(
                  isBangla ? "bn-BD" : "en-BD",
                )}
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Inactive warning */}
          {!data.setting.isActive && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-600">
              {t(
                "চেক-ইন রিওয়ার্ড বর্তমানে বন্ধ রয়েছে।",
                "Check-In reward is currently inactive.",
              )}
            </div>
          )}

          {/* Days */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {data.days?.map((day) => (
              <DayCard
                key={day._id || day.dayNumber}
                day={day}
                dayName={getDayName(day)}
                amount={formatAmount(day.amount, day.rewardType)}
                isBangla={isBangla}
              />
            ))}
          </div>

          {/* Current reward information */}
          {currentDay && (
            <div className="mt-6 rounded-xl border border-[#f2cc25] bg-[#fffbea] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ffc800] text-lg text-black">
                    {currentDay.rewardType === "balance" ? (
                      <FaWallet />
                    ) : (
                      <FaCoins />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-black/50">
                      {t("আজকের পুরস্কার", "Current Reward")}
                    </p>

                    <p className="mt-1 text-lg font-extrabold text-black">
                      {formatAmount(currentDay.amount, currentDay.rewardType)}
                    </p>
                  </div>
                </div>

                {remainingSeconds > 0 && (
                  <div className="flex items-center gap-2 self-start rounded-full bg-black px-4 py-2 text-xs font-extrabold text-white sm:self-auto">
                    <FaClock className="text-[#ffc800]" />

                    <span>{formatTime(remainingSeconds)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Claim button */}
          <button
            type="button"
            disabled={!canClaim}
            onClick={handleClaim}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold transition sm:text-base ${
              canClaim
                ? "cursor-pointer bg-[#ffc800] text-black shadow-[0_6px_16px_rgba(255,200,0,0.28)] hover:bg-[#edba00] active:scale-[0.99]"
                : "cursor-not-allowed bg-gray-200 text-black/35"
            }`}
          >
            {claiming ? (
              <>
                <FaSyncAlt className="animate-spin" />
                {t("ক্লেইম হচ্ছে...", "Claiming...")}
              </>
            ) : remainingSeconds > 0 ? (
              <>
                <FaClock />
                {t(
                  "পরবর্তী চেক-ইনের জন্য অপেক্ষা করুন",
                  "Wait for the next Check-In",
                )}
              </>
            ) : !data.setting.isActive ? (
              <>
                <FaLock />
                {t("চেক-ইন বন্ধ আছে", "Check-In is inactive")}
              </>
            ) : (
              <>
                <FaGift />
                {t("আজকের পুরস্কার ক্লেইম করুন", "Claim Today's Reward")}
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[11px] text-black/45">
            {t(
              "একবার ক্লেইম করার পর পরবর্তী Day আনলক হতে ২৪ ঘণ্টা সময় লাগবে। Day 7-এর পর আবার Day 1 শুরু হবে।",
              "After claiming, the next Day will unlock in 24 hours. After Day 7, the cycle starts again from Day 1.",
            )}
          </p>
        </div>
      </div>

      {/* Congratulation animation */}
      <AnimatePresence>
        {congratulation && (
          <CongratulationModal
            data={congratulation}
            isBangla={isBangla}
            formatAmount={formatAmount}
            onClose={() => setCongratulation(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const DayCard = ({ day, dayName, amount, isBangla }) => {
  const isClaimed = day.status === "claimed";

  const isAvailable = day.status === "available";

  const isWaiting = day.status === "waiting";

  return (
    <motion.div
      whileHover={{
        y: isAvailable ? -4 : 0,
      }}
      className={`relative overflow-hidden rounded-xl border p-3 text-center transition-all sm:p-4 ${
        isAvailable
          ? "border-[#ffc800] bg-[#fff8d6] shadow-[0_5px_18px_rgba(255,200,0,0.22)]"
          : isClaimed
            ? "border-emerald-200 bg-emerald-50"
            : isWaiting
              ? "border-orange-200 bg-orange-50"
              : "border-black/10 bg-[#f1f1f1]"
      }`}
    >
      {isAvailable && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-[#ffc800] px-2 py-1 text-[8px] font-extrabold text-black">
          {isBangla ? "আজ" : "TODAY"}
        </span>
      )}

      <div
        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg sm:h-14 sm:w-14 ${
          isAvailable
            ? "bg-[#ffc800] text-black"
            : isClaimed
              ? "bg-emerald-500 text-white"
              : isWaiting
                ? "bg-orange-400 text-white"
                : "bg-[#292929] text-white/55"
        }`}
      >
        {isClaimed ? (
          <FaCheck />
        ) : isAvailable ? (
          day.rewardType === "balance" ? (
            <FaWallet />
          ) : (
            <FaCoins />
          )
        ) : isWaiting ? (
          <FaClock />
        ) : (
          <FaLock />
        )}
      </div>

      <h3 className="mt-3 truncate text-xs font-extrabold text-black sm:text-sm">
        {dayName}
      </h3>

      <p
        className={`mt-1 truncate text-[10px] font-bold sm:text-xs ${
          isAvailable
            ? "text-[#bd8b00]"
            : isClaimed
              ? "text-emerald-600"
              : "text-black/45"
        }`}
      >
        {amount}
      </p>

      {isClaimed && (
        <p className="mt-1 text-[8px] font-bold uppercase text-emerald-600">
          {isBangla ? "ক্লেইমড" : "Claimed"}
        </p>
      )}
    </motion.div>
  );
};

const BalanceBox = ({ icon, label, value }) => (
  <div className="rounded-xl border border-black/10 bg-white/75 p-3 backdrop-blur-sm">
    <div className="flex items-center gap-2 text-black/55">
      <span className="text-sm">{icon}</span>

      <span className="text-[9px] font-bold uppercase sm:text-[10px]">
        {label}
      </span>
    </div>

    <p className="mt-1 truncate text-sm font-extrabold text-black sm:text-base">
      {value}
    </p>
  </div>
);

const CongratulationModal = ({ data, isBangla, formatAmount, onClose }) => {
  const t = (bn, en) => (isBangla ? bn : en);

  const dayName =
    (isBangla ? data?.dayName?.bn : data?.dayName?.en) ||
    data?.dayName?.en ||
    data?.dayName?.bn ||
    "";

  const confetti = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => ({
        id: index,
        left: `${(index * 29) % 100}%`,
        delay: (index % 8) * 0.08,
        color: ["#ffc800", "#ff4d4d", "#18b84a", "#1683eb", "#8b5cf6"][
          index % 5
        ],
      })),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Confetti */}
      {confetti.map((item) => (
        <motion.span
          key={item.id}
          initial={{
            y: -80,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: typeof window !== "undefined" ? window.innerHeight + 100 : 900,

            rotate: 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2.6 + (item.id % 4) * 0.3,

            delay: item.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute top-0 h-3 w-2 rounded-sm"
          style={{
            left: item.left,
            backgroundColor: item.color,
          }}
        />
      ))}

      <motion.div
        initial={{
          scale: 0.55,
          y: 80,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          y: 0,
          opacity: 1,
        }}
        exit={{
          scale: 0.7,
          opacity: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 14,
        }}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8"
      >
        <motion.div
          animate={{
            rotate: [0, -8, 8, -5, 5, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 1.3,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#ffe879] to-[#ffc400] text-5xl text-black shadow-[0_10px_35px_rgba(255,196,0,0.45)]"
        >
          <FaTrophy />
        </motion.div>

        <motion.h2
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{ delay: 0.25 }}
          className="mt-5 text-2xl font-black text-black"
        >
          {t("অভিনন্দন!", "Congratulations!")}
        </motion.h2>

        <p className="mt-2 text-sm text-black/55">
          {t(
            `${dayName} সফলভাবে ক্লেইম করেছেন`,
            `You successfully claimed ${dayName}`,
          )}
        </p>

        <motion.div
          initial={{
            scale: 0.7,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          transition={{ delay: 0.4 }}
          className="mt-5 rounded-2xl border border-[#f1cf31] bg-[#fff9dd] p-5"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-black/45">
            {t("আপনি পেয়েছেন", "You Received")}
          </p>

          <p className="mt-2 text-3xl font-black text-[#d39b00]">
            {formatAmount(data.amount, data.rewardType)}
          </p>

          <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold text-black/55">
            {data.rewardType === "balance" ? (
              <>
                <FaWallet />
                {t("মেইন ব্যালেন্সে যোগ হয়েছে", "Added to main balance")}
              </>
            ) : (
              <>
                <FaCoins />
                {t("রিওয়ার্ড কয়েনে যোগ হয়েছে", "Added to Reward Coins")}
              </>
            )}
          </div>
        </motion.div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full cursor-pointer rounded-xl bg-[#ffc800] py-3 text-sm font-extrabold text-black transition hover:bg-[#edba00] active:scale-95"
        >
          {t("ধন্যবাদ", "Awesome!")}
        </button>
      </motion.div>
    </motion.div>
  );
};

const CheckInLoading = () => (
  <div className="w-full animate-pulse overflow-hidden rounded-2xl border border-black/10 bg-white">
    <div className="h-36 bg-gray-200" />

    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-32 rounded-xl bg-gray-100" />
        ))}
      </div>

      <div className="mt-6 h-14 rounded-xl bg-gray-200" />
    </div>
  </div>
);

export default CheckIn;
