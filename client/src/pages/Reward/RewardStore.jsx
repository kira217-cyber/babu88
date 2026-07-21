// src/pages/Reward/RewardStore.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaGift,
  FaTimes,
} from "react-icons/fa";

import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectAuth,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";

const ITEMS_PER_PAGE = 8;

const RewardStore = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const token = auth?.token;

  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const resolveImage = (image = "") => {
    if (!image) return "";

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    const baseUrl = String(
      import.meta.env.VITE_API_URL || api.defaults.baseURL || "",
    ).replace(/\/+$/, "");

    const cleanPath = image.startsWith("/") ? image : `/${image}`;

    return `${baseUrl}${cleanPath}`;
  };

  const requestConfig = useMemo(() => {
    if (!token) return {};

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const loadRewards = useCallback(async () => {
    if (!token) {
      setRewards([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.get("/api/rewards", requestConfig);

      setRewards(data?.rewards || []);
    } catch (error) {
      setRewards([]);

      toast.error(
        error?.response?.data?.message ||
          t("রিওয়ার্ড লোড করা যায়নি", "Failed to load rewards"),
      );
    } finally {
      setLoading(false);
    }
  }, [token, requestConfig, isBangla]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  const totalPages = Math.max(Math.ceil(rewards.length / ITEMS_PER_PAGE), 1);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const currentRewards = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return rewards.slice(start, start + ITEMS_PER_PAGE);
  }, [rewards, currentPage]);

  const paginationPages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, totalPages);

    if (end - start < 4) {
      start = Math.max(end - 4, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  const formatMoney = (amount) => {
    return `৳${Number(amount || 0).toLocaleString(
      isBangla ? "bn-BD" : "en-BD",
      {
        maximumFractionDigits: 2,
      },
    )}`;
  };

  const getConditionLabel = (type) => {
    const labels = {
      deposit: t("ডিপোজিট", "Deposit"),
      turnover: t("টার্নওভার", "Turnover"),
      game_loss: t("গেম লস", "Game Loss"),
    };

    return labels[type] || type;
  };

  const getClaimButtonText = (reward) => {
    const eligibility = reward?.eligibility;

    if (claimingId === reward?._id) {
      return t("ক্লেইম হচ্ছে...", "Claiming...");
    }

    if (eligibility?.alreadyClaimed) {
      return t("ক্লেইম করা হয়েছে", "Claimed");
    }

    if (eligibility?.unavailableReason === "CAMPAIGN_NOT_STARTED") {
      return t("শীঘ্রই শুরু হবে", "Coming Soon");
    }

    if (eligibility?.unavailableReason === "CAMPAIGN_EXPIRED") {
      return t("মেয়াদ শেষ", "Expired");
    }

    if (eligibility?.eligible) {
      return t("ক্লেইম করুন", "Claim");
    }

    return t("যোগ্য নন", "Not Eligible");
  };

  const handleClaim = async (reward) => {
    if (!isAuthenticated || !token) {
      toast.error(
        t(
          "রিওয়ার্ড ক্লেইম করতে লগইন করুন",
          "Please log in to claim this reward",
        ),
      );
      return;
    }

    if (
      !reward?.eligibility?.eligible ||
      reward?.eligibility?.alreadyClaimed ||
      claimingId
    ) {
      return;
    }

    try {
      setClaimingId(reward._id);

      const { data } = await api.post(
        `/api/rewards/${reward._id}/claim`,
        {},
        requestConfig,
      );

      toast.success(
        data?.message ||
          t("রিওয়ার্ড সফলভাবে ক্লেইম হয়েছে", "Reward claimed successfully"),
      );

      setSelectedReward(null);
      await loadRewards();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        t("রিওয়ার্ড ক্লেইম করা যায়নি", "Failed to claim reward");

      toast.error(message);

      if (error?.response?.data?.eligibility) {
        await loadRewards();
      }
    } finally {
      setClaimingId(null);
    }
  };

  const goToPage = (page) => {
    const safePage = Math.min(Math.max(page, 1), totalPages);

    setCurrentPage(safePage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <FaGift className="mx-auto text-4xl text-[#f5b800]" />

        <h2 className="mt-4 text-lg font-extrabold text-black">
          {t("রিওয়ার্ড দেখতে লগইন করুন", "Log in to view rewards")}
        </h2>

        <p className="mt-2 text-sm text-black/55">
          {t(
            "আপনার যোগ্য রিওয়ার্ড দেখতে এবং ক্লেইম করতে প্রথমে লগইন করুন।",
            "Please log in to view and claim your eligible rewards.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-3 sm:p-5">
      {/* Heading */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-extrabold text-black sm:text-[22px]">
            {t("রিওয়ার্ড স্টোর", "Reward Store")}
          </h2>

          <p className="mt-1 text-[12px] text-black/50 sm:text-[13px]">
            {t(
              "যোগ্যতা পূরণ করে আপনার পুরস্কার সংগ্রহ করুন।",
              "Complete the requirements and claim your rewards.",
            )}
          </p>
        </div>

        <div className="rounded-full bg-[#ffc800] px-3 py-1.5 text-[11px] font-extrabold text-black sm:text-[13px]">
          {rewards.length} {t("টি পুরস্কার", "Rewards")}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <RewardSkeleton />
      ) : currentRewards.length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-white p-10 text-center">
          <FaGift className="mx-auto text-4xl text-[#ffc800]" />

          <h3 className="mt-4 text-[16px] font-bold text-black">
            {t("কোনো রিওয়ার্ড পাওয়া যায়নি", "No rewards found")}
          </h3>
        </div>
      ) : (
        <>
          {/* Reward cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {currentRewards.map((reward) => {
              const eligibility = reward?.eligibility || {};

              const isClaimed = eligibility.alreadyClaimed;

              const canClaim =
                eligibility.eligible && !isClaimed && claimingId !== reward._id;

              return (
                <div
                  key={reward._id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_3px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ffc800]/80 hover:shadow-[0_7px_20px_rgba(0,0,0,0.10)]"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={resolveImage(reward.bannerImage)}
                      alt={isBangla ? reward.title?.bn : reward.title?.en}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      draggable={false}
                      loading="lazy"
                    />

                    <span className="absolute left-2 top-2 max-w-[80%] truncate rounded-full bg-black/70 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-sm sm:text-[10px]">
                      {getConditionLabel(reward.conditionType)}
                    </span>

                    {isClaimed && (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                        <FaCheckCircle size={13} />
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-2.5 sm:p-4">
                    <h3 className="line-clamp-2 min-h-[36px] text-[12px] font-extrabold leading-[18px] text-black sm:min-h-[44px] sm:text-[15px] sm:leading-[22px]">
                      {(isBangla ? reward.title?.bn : reward.title?.en) ||
                        reward.title?.en ||
                        reward.title?.bn ||
                        t("রিওয়ার্ড", "Reward")}
                    </h3>

                    <div className="mt-2 rounded-lg bg-[#fff7d6] p-2">
                      <p className="text-[9px] font-medium text-black/50 sm:text-[11px]">
                        {t("পুরস্কারের পরিমাণ", "Reward Amount")}
                      </p>

                      <p className="mt-0.5 text-[14px] font-extrabold text-[#d69d00] sm:text-[18px]">
                        {formatMoney(reward.rewardAmount)}
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="mt-auto grid grid-cols-2 gap-1.5 pt-3 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedReward(reward)}
                        className="cursor-pointer rounded-lg border border-[#ffc800] bg-white px-1 py-2 text-[9px] font-bold text-black transition hover:bg-[#fff8dc] active:scale-95 sm:px-2 sm:py-2.5 sm:text-[12px]"
                      >
                        {t("বিস্তারিত", "View Details")}
                      </button>

                      <button
                        type="button"
                        disabled={!canClaim}
                        onClick={() => handleClaim(reward)}
                        className={`rounded-lg px-1 py-2 text-[9px] font-extrabold transition sm:px-2 sm:py-2.5 sm:text-[12px] ${
                          canClaim
                            ? "cursor-pointer bg-[#ffc800] text-black hover:bg-[#edba00] active:scale-95"
                            : "cursor-not-allowed bg-[#e5e5e5] text-black/35"
                        }`}
                      >
                        {getClaimButtonText(reward)}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                className={`flex h-9 items-center justify-center rounded-lg px-3 text-sm font-bold transition ${
                  currentPage === 1
                    ? "cursor-not-allowed bg-gray-200 text-black/25"
                    : "cursor-pointer border border-black/10 bg-white text-black hover:border-[#ffc800] hover:bg-[#fff8dc]"
                }`}
              >
                <FaChevronLeft size={12} />

                <span className="ml-1 hidden sm:inline">
                  {t("আগের", "Previous")}
                </span>
              </button>

              {paginationPages.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`h-9 min-w-9 cursor-pointer rounded-lg px-2 text-sm font-extrabold transition ${
                    currentPage === page
                      ? "bg-[#ffc800] text-black shadow-sm"
                      : "border border-black/10 bg-white text-black/60 hover:border-[#ffc800] hover:text-black"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className={`flex h-9 items-center justify-center rounded-lg px-3 text-sm font-bold transition ${
                  currentPage === totalPages
                    ? "cursor-not-allowed bg-gray-200 text-black/25"
                    : "cursor-pointer border border-black/10 bg-white text-black hover:border-[#ffc800] hover:bg-[#fff8dc]"
                }`}
              >
                <span className="mr-1 hidden sm:inline">
                  {t("পরের", "Next")}
                </span>

                <FaChevronRight size={12} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Details modal */}
      {selectedReward && (
        <RewardDetailsModal
          reward={selectedReward}
          isBangla={isBangla}
          claiming={claimingId === selectedReward._id}
          onClose={() => setSelectedReward(null)}
          onClaim={() => handleClaim(selectedReward)}
          resolveImage={resolveImage}
          formatMoney={formatMoney}
          getConditionLabel={getConditionLabel}
          getClaimButtonText={getClaimButtonText}
        />
      )}
    </div>
  );
};

const RewardDetailsModal = ({
  reward,
  isBangla,
  claiming,
  onClose,
  onClaim,
  resolveImage,
  formatMoney,
  getConditionLabel,
  getClaimButtonText,
}) => {
  const t = (bn, en) => (isBangla ? bn : en);

  const eligibility = reward?.eligibility || {};

  const canClaim =
    eligibility.eligible && !eligibility.alreadyClaimed && !claiming;

  const progress = Math.min(
    Math.max(Number(eligibility.progressPercent || 0), 0),
    100,
  );

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative">
          <img
            src={resolveImage(reward.bannerImage)}
            alt={isBangla ? reward.title?.bn : reward.title?.en}
            className="h-[190px] w-full rounded-t-2xl object-cover sm:h-[260px]"
          />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="text-[19px] font-extrabold text-black sm:text-[23px]">
            {(isBangla ? reward.title?.bn : reward.title?.en) ||
              reward.title?.en ||
              reward.title?.bn}
          </h2>

          <p className="mt-3 text-[13px] leading-6 text-black/60 sm:text-[14px]">
            {(isBangla ? reward.description?.bn : reward.description?.en) ||
              reward.description?.en ||
              reward.description?.bn ||
              t("কোনো বিবরণ দেওয়া হয়নি।", "No description available.")}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <DetailBox
              label={t("শর্ত", "Requirement")}
              value={getConditionLabel(reward.conditionType)}
            />

            <DetailBox
              label={t("প্রয়োজন", "Required Amount")}
              value={formatMoney(
                eligibility.requiredAmount ?? reward.requiredAmount,
              )}
            />

            <DetailBox
              label={t("পুরস্কার", "Reward Amount")}
              value={formatMoney(reward.rewardAmount)}
            />

            <DetailBox
              label={t("টার্নওভার", "Turnover")}
              value={`${Number(reward.turnoverMultiplier || 0)}x`}
            />
          </div>

          {/* Progress */}
          <div className="mt-5 rounded-xl bg-[#f5f5f5] p-4">
            <div className="flex items-center justify-between gap-3 text-[12px] font-semibold">
              <span className="text-black/60">
                {t("আপনার অগ্রগতি", "Your Progress")}
              </span>

              <span className="text-black">
                {formatMoney(eligibility.achievedAmount || 0)} /{" "}
                {formatMoney(
                  eligibility.requiredAmount ?? reward.requiredAmount,
                )}
              </span>
            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-[#ffc800] transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-right text-[11px] font-bold text-[#bc8a00]">
              {progress.toFixed(2)}%
            </p>
          </div>

          <button
            type="button"
            disabled={!canClaim}
            onClick={onClaim}
            className={`mt-5 w-full rounded-xl py-3 text-[14px] font-extrabold transition ${
              canClaim
                ? "cursor-pointer bg-[#ffc800] text-black hover:bg-[#edba00] active:scale-[0.99]"
                : "cursor-not-allowed bg-gray-200 text-black/35"
            }`}
          >
            {getClaimButtonText(reward)}
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailBox = ({ label, value }) => (
  <div className="rounded-xl border border-black/10 bg-white p-3 shadow-sm">
    <p className="text-[10px] font-medium uppercase text-black/40 sm:text-[11px]">
      {label}
    </p>

    <p className="mt-1 text-[13px] font-extrabold text-black sm:text-[15px]">
      {value}
    </p>
  </div>
);

const RewardSkeleton = () => (
  <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={index}
        className="overflow-hidden rounded-xl border border-black/10 bg-white"
      >
        <div className="aspect-[16/10] animate-pulse bg-gray-200" />

        <div className="p-3">
          <div className="h-4 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-12 animate-pulse rounded-lg bg-gray-100" />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="h-9 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-9 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default RewardStore;
