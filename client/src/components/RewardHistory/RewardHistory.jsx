// src/pages/Reward/RewardHistory.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaGift,
  FaHistory,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";

import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectAuth,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";

const ITEMS_PER_PAGE = 10;

const RewardHistory = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const token = auth?.token;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState("all");
  const [conditionType, setConditionType] = useState("all");

  const [calculationPeriod, setCalculationPeriod] = useState("all");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  const requestConfig = useMemo(() => {
    if (!token) return {};

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const loadHistory = useCallback(async () => {
    if (!token) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (status !== "all") {
        params.status = status;
      }

      if (conditionType !== "all") {
        params.conditionType = conditionType;
      }

      if (calculationPeriod !== "all") {
        params.calculationPeriod = calculationPeriod;
      }

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      const { data } = await api.get("/api/rewards/my/history", {
        ...requestConfig,
        params,
      });

      setHistory(data?.history || []);

      setPagination({
        page: Number(data?.pagination?.page || currentPage),

        limit: Number(data?.pagination?.limit || ITEMS_PER_PAGE),

        total: Number(data?.pagination?.total || 0),

        totalPages: Math.max(Number(data?.pagination?.totalPages || 1), 1),
      });
    } catch (error) {
      setHistory([]);

      toast.error(
        error?.response?.data?.message ||
          t("রিওয়ার্ড ইতিহাস লোড করা যায়নি", "Failed to load reward history"),
      );
    } finally {
      setLoading(false);
    }
  }, [
    token,
    requestConfig,
    currentPage,
    debouncedSearch,
    status,
    conditionType,
    calculationPeriod,
    startDate,
    endDate,
    isBangla,
  ]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const resolveImage = (image = "") => {
    if (!image) return "";

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    const baseUrl = String(
      import.meta.env.VITE_API_URL || api.defaults.baseURL || "",
    ).replace(/\/+$/, "");

    return `${baseUrl}${image.startsWith("/") ? image : `/${image}`}`;
  };

  const formatMoney = (amount) => {
    return `৳${Number(amount || 0).toLocaleString(
      isBangla ? "bn-BD" : "en-BD",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "—";
    }

    return value.toLocaleString(isBangla ? "bn-BD" : "en-BD", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTitle = (item) => {
    const snapshotTitle = item?.rewardSnapshot?.title;

    const currentTitle = item?.reward?.title;

    return (
      (isBangla ? snapshotTitle?.bn : snapshotTitle?.en) ||
      (isBangla ? currentTitle?.bn : currentTitle?.en) ||
      snapshotTitle?.en ||
      snapshotTitle?.bn ||
      currentTitle?.en ||
      currentTitle?.bn ||
      t("রিওয়ার্ড", "Reward")
    );
  };

  const getImage = (item) => {
    return item?.rewardSnapshot?.bannerImage || item?.reward?.bannerImage || "";
  };

  const getCondition = (item) => {
    const type =
      item?.rewardSnapshot?.conditionType || item?.reward?.conditionType;

    const labels = {
      deposit: t("ডিপোজিট", "Deposit"),
      turnover: t("টার্নওভার", "Turnover"),
      game_loss: t("গেম লস", "Game Loss"),
    };

    return labels[type] || type || "—";
  };

  const getPeriod = (item) => {
    const period =
      item?.rewardSnapshot?.calculationPeriod ||
      item?.reward?.calculationPeriod;

    if (period === "campaign") {
      return t("ক্যাম্পেইন", "Campaign");
    }

    if (period === "lifetime") {
      return t("লাইফটাইম", "Lifetime");
    }

    return "—";
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setConditionType("all");
    setCalculationPeriod("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search ||
    status !== "all" ||
    conditionType !== "all" ||
    calculationPeriod !== "all" ||
    startDate ||
    endDate;

  const goToPage = (page) => {
    const targetPage = Math.min(Math.max(page, 1), pagination.totalPages);

    setCurrentPage(targetPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const pageNumbers = useMemo(() => {
    const totalPages = pagination.totalPages;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, totalPages);

    if (end - start < 4) {
      start = Math.max(end - 4, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, pagination.totalPages]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-8 text-center">
        <FaHistory className="mx-auto text-4xl text-[#ffc800]" />

        <h2 className="mt-4 text-lg font-extrabold text-black">
          {t(
            "রিওয়ার্ড ইতিহাস দেখতে লগইন করুন",
            "Log in to view reward history",
          )}
        </h2>

        <p className="mt-2 text-sm text-black/55">
          {t(
            "শুধুমাত্র লগইন করা ব্যবহারকারী নিজের রিওয়ার্ড ইতিহাস দেখতে পারবেন।",
            "Only logged-in users can view their own reward history.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f5f5f5] p-3 sm:p-5">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-[19px] font-extrabold text-black sm:text-[23px]">
            <FaHistory className="text-[#e9ad00]" />
            {t("রিওয়ার্ড ইতিহাস", "Reward History")}
          </h1>

          <p className="mt-1 text-[12px] text-black/50 sm:text-[13px]">
            {t(
              "আপনার ক্লেইম করা সব রিওয়ার্ড এখানে দেখুন।",
              "View all your claimed rewards here.",
            )}
          </p>
        </div>

        <div className="self-start rounded-full bg-[#ffc800] px-4 py-2 text-xs font-extrabold text-black sm:self-auto">
          {t("মোট", "Total")}: {pagination.total}
        </div>
      </div>

      {/* Search and filters */}
      <div className="mb-5 rounded-xl border border-black/10 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-black">
          <FaFilter className="text-[#e7aa00]" />
          {t("সার্চ ও ফিল্টার", "Search & Filter")}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="relative sm:col-span-2 lg:col-span-1 xl:col-span-2">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-black/35" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("রিওয়ার্ড খুঁজুন...", "Search rewards...")}
              className="h-10 w-full rounded-lg border border-black/10 bg-[#f7f7f7] pl-9 pr-3 text-[13px] text-black outline-none transition focus:border-[#ffc800]"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setCurrentPage(1);
            }}
            className="h-10 cursor-pointer rounded-lg border border-black/10 bg-[#f7f7f7] px-3 text-[13px] text-black outline-none focus:border-[#ffc800]"
          >
            <option value="all">{t("সব স্ট্যাটাস", "All Status")}</option>
            <option value="claimed">{t("ক্লেইমড", "Claimed")}</option>
            <option value="processing">{t("প্রসেসিং", "Processing")}</option>
            <option value="failed">{t("ব্যর্থ", "Failed")}</option>
          </select>

          <select
            value={conditionType}
            onChange={(event) => {
              setConditionType(event.target.value);
              setCurrentPage(1);
            }}
            className="h-10 cursor-pointer rounded-lg border border-black/10 bg-[#f7f7f7] px-3 text-[13px] text-black outline-none focus:border-[#ffc800]"
          >
            <option value="all">{t("সব ধরন", "All Types")}</option>
            <option value="deposit">{t("ডিপোজিট", "Deposit")}</option>
            <option value="turnover">{t("টার্নওভার", "Turnover")}</option>
            <option value="game_loss">{t("গেম লস", "Game Loss")}</option>
          </select>

          <select
            value={calculationPeriod}
            onChange={(event) => {
              setCalculationPeriod(event.target.value);
              setCurrentPage(1);
            }}
            className="h-10 cursor-pointer rounded-lg border border-black/10 bg-[#f7f7f7] px-3 text-[13px] text-black outline-none focus:border-[#ffc800]"
          >
            <option value="all">{t("সব সময়কাল", "All Periods")}</option>
            <option value="campaign">{t("ক্যাম্পেইন", "Campaign")}</option>
            <option value="lifetime">{t("লাইফটাইম", "Lifetime")}</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              setCurrentPage(1);
            }}
            className="h-10 cursor-pointer rounded-lg border border-black/10 bg-[#f7f7f7] px-3 text-[12px] text-black outline-none focus:border-[#ffc800]"
          />

          <input
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setCurrentPage(1);
            }}
            className="h-10 cursor-pointer rounded-lg border border-black/10 bg-[#f7f7f7] px-3 text-[12px] text-black outline-none focus:border-[#ffc800]"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
          >
            <FaTimes size={11} />
            {t("ফিল্টার মুছুন", "Clear Filters")}
          </button>
        )}
      </div>

      {/* History */}
      {loading ? (
        <HistorySkeleton />
      ) : history.length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-white p-10 text-center">
          <FaGift className="mx-auto text-4xl text-[#ffc800]" />

          <h3 className="mt-4 text-base font-extrabold text-black">
            {t(
              "কোনো রিওয়ার্ড ইতিহাস পাওয়া যায়নি",
              "No reward history found",
            )}
          </h3>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm md:block">
            <table className="min-w-[1050px] w-full">
              <thead className="bg-[#ffc800]">
                <tr className="text-left text-[11px] font-extrabold uppercase text-black">
                  <th className="px-4 py-3">{t("রিওয়ার্ড", "Reward")}</th>
                  <th className="px-4 py-3">{t("ধরন", "Type")}</th>
                  <th className="px-4 py-3">{t("যোগ্যতা", "Progress")}</th>
                  <th className="px-4 py-3">
                    {t("রিওয়ার্ড", "Reward Amount")}
                  </th>
                  <th className="px-4 py-3">{t("টার্নওভার", "Turnover")}</th>
                  <th className="px-4 py-3">{t("স্ট্যাটাস", "Status")}</th>
                  <th className="px-4 py-3">{t("তারিখ", "Claimed At")}</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-black/5 text-[12px] text-black/70 transition hover:bg-[#fffbea]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex min-w-[190px] items-center gap-3">
                        <img
                          src={resolveImage(getImage(item))}
                          alt={getTitle(item)}
                          className="h-11 w-16 rounded-lg border border-black/10 object-cover"
                        />

                        <div>
                          <p className="line-clamp-2 font-bold text-black">
                            {getTitle(item)}
                          </p>

                          <p className="mt-1 text-[10px] text-black/40">
                            {getPeriod(item)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      {getCondition(item)}
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-bold text-black">
                        {formatMoney(item.achievedAmount)}
                      </span>
                      <span className="text-black/35">
                        {" "}
                        / {formatMoney(item.requiredAmount)}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-extrabold text-[#c28f00]">
                      {formatMoney(item.rewardAmount)}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-bold text-black">
                        {item.turnoverMultiplier}x
                      </p>

                      <p className="text-[10px] text-black/40">
                        {formatMoney(item.requiredTurnover)}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} isBangla={isBangla} />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(item.claimedAt || item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {history.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-black/10 bg-white p-3 shadow-sm"
              >
                <div className="flex gap-3">
                  <img
                    src={resolveImage(getImage(item))}
                    alt={getTitle(item)}
                    className="h-16 w-24 shrink-0 rounded-lg border border-black/10 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-[13px] font-extrabold text-black">
                      {getTitle(item)}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-[#fff3bd] px-2 py-1 text-[9px] font-bold text-[#9b7200]">
                        {getCondition(item)}
                      </span>

                      <span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-bold text-black/55">
                        {getPeriod(item)}
                      </span>

                      <StatusBadge status={item.status} isBangla={isBangla} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <MobileInfo
                    label={t("অর্জিত", "Achieved")}
                    value={formatMoney(item.achievedAmount)}
                  />

                  <MobileInfo
                    label={t("পুরস্কার", "Reward")}
                    value={formatMoney(item.rewardAmount)}
                  />

                  <MobileInfo
                    label={t("টার্নওভার", "Turnover")}
                    value={`${item.turnoverMultiplier}x (${formatMoney(
                      item.requiredTurnover,
                    )})`}
                  />

                  <MobileInfo
                    label={t("তারিখ", "Date")}
                    value={formatDate(item.claimedAt || item.createdAt)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                className={`flex h-9 items-center justify-center rounded-lg px-3 text-xs font-bold ${
                  currentPage === 1
                    ? "cursor-not-allowed bg-gray-200 text-black/25"
                    : "cursor-pointer border border-black/10 bg-white text-black hover:border-[#ffc800]"
                }`}
              >
                <FaChevronLeft size={11} />
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`h-9 min-w-9 cursor-pointer rounded-lg px-2 text-xs font-extrabold ${
                    currentPage === page
                      ? "bg-[#ffc800] text-black"
                      : "border border-black/10 bg-white text-black/60 hover:border-[#ffc800]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === pagination.totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className={`flex h-9 items-center justify-center rounded-lg px-3 text-xs font-bold ${
                  currentPage === pagination.totalPages
                    ? "cursor-not-allowed bg-gray-200 text-black/25"
                    : "cursor-pointer border border-black/10 bg-white text-black hover:border-[#ffc800]"
                }`}
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const StatusBadge = ({ status, isBangla }) => {
  const config = {
    claimed: {
      text: isBangla ? "ক্লেইমড" : "Claimed",
      className: "bg-emerald-100 text-emerald-700",
    },

    processing: {
      text: isBangla ? "প্রসেসিং" : "Processing",
      className: "bg-yellow-100 text-yellow-700",
    },

    failed: {
      text: isBangla ? "ব্যর্থ" : "Failed",
      className: "bg-red-100 text-red-700",
    },
  };

  const value = config[status] || config.processing;

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[9px] font-extrabold ${value.className}`}
    >
      {value.text}
    </span>
  );
};

const MobileInfo = ({ label, value }) => (
  <div className="rounded-lg bg-[#f7f7f7] p-2">
    <p className="text-[9px] font-medium text-black/40">{label}</p>

    <p className="mt-1 break-words text-[11px] font-bold text-black">{value}</p>
  </div>
);

const HistorySkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-3"
      >
        <div className="h-14 w-20 animate-pulse rounded-lg bg-gray-200" />

        <div className="flex-1">
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    ))}
  </div>
);

export default RewardHistory;
