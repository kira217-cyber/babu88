// src/pages/Reward/RewardStoreHistory.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCoins,
  FaFilter,
  FaGift,
  FaHistory,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTrophy,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const ITEMS_PER_PAGE = 20;

const RewardStoreHistory = () => {
  const [activeTab, setActiveTab] = useState("reward-store");

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState("all");

  const [conditionType, setConditionType] = useState("all");

  const [calculationPeriod, setCalculationPeriod] = useState("all");

  const [prizeType, setPrizeType] = useState("all");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
  });

  const [rewardSummary, setRewardSummary] = useState({
    totalClaims: 0,
    claimedAmount: 0,
    requiredTurnover: 0,
    uniqueUsers: 0,
  });

  const [wheelSummary, setWheelSummary] = useState({
    totalSpins: 0,
    totalCoinSpent: 0,
    totalBalancePrize: 0,
    totalRewardCoinPrize: 0,
    uniqueUsers: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());

      setCurrentPage(1);
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  const loadHistory = useCallback(async () => {
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

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      let endpoint = "/api/admin/reward-claims";

      if (activeTab === "reward-store") {
        if (conditionType !== "all") {
          params.conditionType = conditionType;
        }

        if (calculationPeriod !== "all") {
          params.calculationPeriod = calculationPeriod;
        }
      } else {
        endpoint = "/api/admin/wheel-spin-history";

        if (prizeType !== "all") {
          params.prizeType = prizeType;
        }
      }

      const { data } = await api.get(endpoint, {
        params,
      });

      setHistory(data?.history || data?.claims || []);

      setPagination({
        page: Number(data?.pagination?.page || currentPage),

        limit: Number(data?.pagination?.limit || ITEMS_PER_PAGE),

        total: Number(data?.pagination?.total || 0),

        totalPages: Math.max(Number(data?.pagination?.totalPages || 1), 1),
      });

      if (activeTab === "reward-store") {
        setRewardSummary({
          totalClaims: Number(
            data?.summary?.totalClaims || data?.pagination?.total || 0,
          ),

          claimedAmount: Number(data?.summary?.claimedAmount || 0),

          requiredTurnover: Number(data?.summary?.requiredTurnover || 0),

          uniqueUsers: Number(data?.summary?.uniqueUsers || 0),
        });
      } else {
        setWheelSummary({
          totalSpins: Number(
            data?.summary?.totalSpins || data?.pagination?.total || 0,
          ),

          totalCoinSpent: Number(data?.summary?.totalCoinSpent || 0),

          totalBalancePrize: Number(data?.summary?.totalBalancePrize || 0),

          totalRewardCoinPrize: Number(
            data?.summary?.totalRewardCoinPrize || 0,
          ),

          uniqueUsers: Number(data?.summary?.uniqueUsers || 0),
        });
      }
    } catch (error) {
      setHistory([]);

      toast.error(error?.response?.data?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    currentPage,
    debouncedSearch,
    status,
    conditionType,
    calculationPeriod,
    prizeType,
    startDate,
    endDate,
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
    return `৳${Number(amount || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (amount) => {
    return Number(amount || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "—";
    }

    return value.toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRewardTitle = (item) => {
    return (
      item?.rewardSnapshot?.title?.en ||
      item?.rewardSnapshot?.title?.bn ||
      item?.reward?.title?.en ||
      item?.reward?.title?.bn ||
      "Reward"
    );
  };

  const getRewardImage = (item) => {
    return item?.rewardSnapshot?.bannerImage || item?.reward?.bannerImage || "";
  };

  const getWheelTitle = (item) => {
    return (
      item?.wheelSnapshot?.title?.en ||
      item?.wheelSnapshot?.title?.bn ||
      item?.wheel?.title?.en ||
      item?.wheel?.title?.bn ||
      "Wheel of Fortune"
    );
  };

  const getWheelImage = (item) => {
    return item?.wheelSnapshot?.wheelImage || item?.wheel?.wheelImage || "";
  };

  const getCondition = (item) => {
    const type =
      item?.rewardSnapshot?.conditionType || item?.reward?.conditionType;

    const values = {
      deposit: "Deposit",
      turnover: "Turnover",
      game_loss: "Game Loss",
    };

    return values[type] || type || "—";
  };

  const getPeriod = (item) => {
    const period =
      item?.rewardSnapshot?.calculationPeriod ||
      item?.reward?.calculationPeriod;

    if (period === "campaign") {
      return "Campaign";
    }

    if (period === "lifetime") {
      return "Lifetime";
    }

    return "—";
  };

  const getUserName = (item) => {
    return item?.user?.username || item?.user?.userId || "Unknown User";
  };

  const getUserIdentity = (item) => {
    return (
      item?.user?.phone ||
      item?.user?.email ||
      String(item?.user?._id || item?.user || "")
    );
  };

  const getPrizeTypeLabel = (item) => {
    const type = item?.prizeSnapshot?.prizeType;

    const labels = {
      balance: "Balance",
      reward_coin: "Reward Coin",
      no_prize: "No Prize",
    };

    return labels[type] || "—";
  };

  const getWheelPrizeAmount = (item) => {
    const type = item?.prizeSnapshot?.prizeType;

    const amount = Number(item?.prizeSnapshot?.amount || 0);

    if (type === "reward_coin") {
      return `${formatNumber(amount)} Coins`;
    }

    if (type === "no_prize") {
      return "No Prize";
    }

    return formatMoney(amount);
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;

    setActiveTab(tab);
    setHistory([]);
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setConditionType("all");
    setCalculationPeriod("all");
    setPrizeType("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setConditionType("all");
    setCalculationPeriod("all");
    setPrizeType("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search ||
    status !== "all" ||
    conditionType !== "all" ||
    calculationPeriod !== "all" ||
    prizeType !== "all" ||
    startDate ||
    endDate;

  const goToPage = (page) => {
    const safePage = Math.min(Math.max(page, 1), pagination.totalPages);

    setCurrentPage(safePage);

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

    return Array.from(
      {
        length: end - start + 1,
      },
      (_, index) => start + index,
    );
  }, [currentPage, pagination.totalPages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black p-4 text-white lg:p-6">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-2xl font-bold text-transparent lg:text-3xl">
            <FaHistory className="text-yellow-400" />
            Reward History
          </h1>

          <p className="mt-2 text-sm text-yellow-100/60">
            View Reward Store claims and Wheel Spin history from all users.
          </p>
        </div>

        {/* Main tabs */}
        <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl border border-yellow-700/40 bg-black/60 p-2">
          <button
            type="button"
            onClick={() => handleTabChange("reward-store")}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-extrabold transition sm:text-sm ${
              activeTab === "reward-store"
                ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg"
                : "bg-white/5 text-yellow-100/60 hover:bg-yellow-900/30 hover:text-yellow-200"
            }`}
          >
            <FaGift />
            Reward Store History
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("wheel-spin")}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-extrabold transition sm:text-sm ${
              activeTab === "wheel-spin"
                ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg"
                : "bg-white/5 text-yellow-100/60 hover:bg-yellow-900/30 hover:text-yellow-200"
            }`}
          >
            <FaTrophy />
            Wheel Spin History
          </button>
        </div>

        {/* Summary */}
        {activeTab === "reward-store" ? (
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryCard
              label="Total Claims"
              value={rewardSummary.totalClaims}
              icon={<FaHistory />}
            />

            <SummaryCard
              label="Unique Users"
              value={rewardSummary.uniqueUsers}
              icon={<FaUsers />}
            />

            <SummaryCard
              label="Reward Amount"
              value={formatMoney(rewardSummary.claimedAmount)}
              icon={<FaGift />}
            />

            <SummaryCard
              label="Required Turnover"
              value={formatMoney(rewardSummary.requiredTurnover)}
              icon={<FaFilter />}
            />
          </div>
        ) : (
      
          <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-5">
            <SummaryCard
              label="Total Spins"
              value={wheelSummary.totalSpins}
              icon={<FaSyncAlt />}
            />

            <SummaryCard
              label="Unique Users"
              value={wheelSummary.uniqueUsers}
              icon={<FaUsers />}
            />

            <SummaryCard
              label="Coins Spent"
              value={`${formatNumber(wheelSummary.totalCoinSpent)} Coins`}
              icon={<FaCoins />}
            />

            <SummaryCard
              label="Balance Prize"
              value={formatMoney(wheelSummary.totalBalancePrize)}
              icon={<FaWallet />}
            />

            <SummaryCard
              label="Coin Prize"
              value={`${formatNumber(wheelSummary.totalRewardCoinPrize)} Coins`}
              icon={<FaTrophy />}
            />
          </div>

        )}

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-yellow-700/40 bg-black/60 p-4 shadow-xl lg:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-bold text-yellow-300">
              <FaFilter />
              Search & Filters
            </h2>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-800/60 px-3 py-2 text-xs font-bold text-red-100 hover:bg-red-700"
              >
                <FaTimes size={11} />
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="relative sm:col-span-2 xl:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-yellow-400/50" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  activeTab === "reward-store"
                    ? "Search user, phone or reward..."
                    : "Search user, Spin ID or Wheel..."
                }
                className="h-11 w-full rounded-xl border border-yellow-700/50 bg-black/70 pl-10 pr-3 text-sm text-white placeholder-yellow-400/40 outline-none focus:border-yellow-400"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);

                setCurrentPage(1);
              }}
              className="h-11 cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-3 text-sm text-white outline-none focus:border-yellow-400"
            >
              <option value="all">All Status</option>

              {activeTab === "reward-store" ? (
                <>
                  <option value="claimed">Claimed</option>

                  <option value="processing">Processing</option>

                  <option value="failed">Failed</option>
                </>
              ) : (
                <>
                  <option value="completed">Completed</option>

                  <option value="processing">Processing</option>

                  <option value="failed">Failed</option>
                </>
              )}
            </select>

            {activeTab === "reward-store" ? (
              <>
                <select
                  value={conditionType}
                  onChange={(event) => {
                    setConditionType(event.target.value);

                    setCurrentPage(1);
                  }}
                  className="h-11 cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-3 text-sm text-white outline-none focus:border-yellow-400"
                >
                  <option value="all">All Reward Types</option>

                  <option value="deposit">Deposit</option>

                  <option value="turnover">Turnover</option>

                  <option value="game_loss">Game Loss</option>
                </select>

                <select
                  value={calculationPeriod}
                  onChange={(event) => {
                    setCalculationPeriod(event.target.value);

                    setCurrentPage(1);
                  }}
                  className="h-11 cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-3 text-sm text-white outline-none focus:border-yellow-400"
                >
                  <option value="all">All Periods</option>

                  <option value="campaign">Campaign</option>

                  <option value="lifetime">Lifetime</option>
                </select>
              </>
            ) : (
              <select
                value={prizeType}
                onChange={(event) => {
                  setPrizeType(event.target.value);

                  setCurrentPage(1);
                }}
                className="h-11 cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-3 text-sm text-white outline-none focus:border-yellow-400"
              >
                <option value="all">All Prize Types</option>

                <option value="balance">Balance</option>

                <option value="reward_coin">Reward Coin</option>

                <option value="no_prize">No Prize</option>
              </select>
            )}

            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);

                setCurrentPage(1);
              }}
              className="h-11 cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-3 text-xs text-white outline-none focus:border-yellow-400 [color-scheme:dark]"
            />

            <input
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);

                setCurrentPage(1);
              }}
              className="h-11 cursor-pointer rounded-xl border border-yellow-700/50 bg-black/70 px-3 text-xs text-white outline-none focus:border-yellow-400 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* History */}
        {loading ? (
          <HistoryLoading />
        ) : history.length === 0 ? (
          <EmptyHistory activeTab={activeTab} />
        ) : (
          <>
            {activeTab === "reward-store" ? (
              <>
                <RewardDesktopTable
                  history={history}
                  resolveImage={resolveImage}
                  formatMoney={formatMoney}
                  formatDate={formatDate}
                  getRewardTitle={getRewardTitle}
                  getRewardImage={getRewardImage}
                  getCondition={getCondition}
                  getPeriod={getPeriod}
                  getUserName={getUserName}
                  getUserIdentity={getUserIdentity}
                />

                <RewardMobileCards
                  history={history}
                  resolveImage={resolveImage}
                  formatMoney={formatMoney}
                  formatDate={formatDate}
                  getRewardTitle={getRewardTitle}
                  getRewardImage={getRewardImage}
                  getCondition={getCondition}
                  getPeriod={getPeriod}
                  getUserName={getUserName}
                  getUserIdentity={getUserIdentity}
                />
              </>
            ) : (
              <>
                <WheelDesktopTable
                  history={history}
                  resolveImage={resolveImage}
                  formatMoney={formatMoney}
                  formatNumber={formatNumber}
                  formatDate={formatDate}
                  getWheelTitle={getWheelTitle}
                  getWheelImage={getWheelImage}
                  getPrizeTypeLabel={getPrizeTypeLabel}
                  getWheelPrizeAmount={getWheelPrizeAmount}
                  getUserName={getUserName}
                  getUserIdentity={getUserIdentity}
                />

                <WheelMobileCards
                  history={history}
                  resolveImage={resolveImage}
                  formatMoney={formatMoney}
                  formatNumber={formatNumber}
                  formatDate={formatDate}
                  getWheelTitle={getWheelTitle}
                  getWheelImage={getWheelImage}
                  getPrizeTypeLabel={getPrizeTypeLabel}
                  getWheelPrizeAmount={getWheelPrizeAmount}
                  getUserName={getUserName}
                  getUserIdentity={getUserIdentity}
                />
              </>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              pageNumbers={pageNumbers}
              goToPage={goToPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

/* ======================================================
   REWARD STORE DESKTOP TABLE
====================================================== */

const RewardDesktopTable = ({
  history,
  resolveImage,
  formatMoney,
  formatDate,
  getRewardTitle,
  getRewardImage,
  getCondition,
  getPeriod,
  getUserName,
  getUserIdentity,
}) => (
  <div className="hidden overflow-x-auto rounded-2xl border border-yellow-700/40 bg-black/60 shadow-xl md:block">
    <table className="w-full min-w-[1250px]">
      <thead className="bg-gradient-to-r from-yellow-600 to-amber-500 text-black">
        <tr className="text-left text-xs font-extrabold uppercase">
          <th className="px-4 py-4">User</th>
          <th className="px-4 py-4">Reward</th>
          <th className="px-4 py-4">Type</th>
          <th className="px-4 py-4">Eligibility</th>
          <th className="px-4 py-4">Reward</th>
          <th className="px-4 py-4">Turnover</th>
          <th className="px-4 py-4">Balance</th>
          <th className="px-4 py-4">Status</th>
          <th className="px-4 py-4">Claimed At</th>
        </tr>
      </thead>

      <tbody>
        {history.map((item) => (
          <tr
            key={item._id}
            className="border-t border-yellow-800/25 text-xs text-yellow-100/75 transition hover:bg-yellow-950/35"
          >
            <td className="px-4 py-4">
              <UserDetails
                name={getUserName(item)}
                identity={getUserIdentity(item)}
              />
            </td>

            <td className="px-4 py-4">
              <div className="flex min-w-[210px] items-center gap-3">
                <img
                  src={resolveImage(getRewardImage(item))}
                  alt={getRewardTitle(item)}
                  className="h-12 w-20 rounded-lg border border-yellow-700/40 object-cover"
                />

                <div>
                  <p className="line-clamp-2 font-bold text-yellow-100">
                    {getRewardTitle(item)}
                  </p>

                  <p className="mt-1 text-[10px] text-yellow-300/50">
                    {getPeriod(item)}
                  </p>
                </div>
              </div>
            </td>

            <td className="px-4 py-4 font-semibold">{getCondition(item)}</td>

            <td className="px-4 py-4">
              <p className="font-bold text-white">
                {formatMoney(item.achievedAmount)}
              </p>

              <p className="mt-1 text-[10px] text-yellow-200/45">
                Required: {formatMoney(item.requiredAmount)}
              </p>
            </td>

            <td className="px-4 py-4 font-extrabold text-yellow-300">
              {formatMoney(item.rewardAmount)}
            </td>

            <td className="px-4 py-4">
              <p className="font-bold text-white">
                {item.turnoverMultiplier || 0}x
              </p>

              <p className="mt-1 text-[10px] text-yellow-200/45">
                {formatMoney(item.requiredTurnover)}
              </p>
            </td>

            <td className="px-4 py-4">
              <p>Before: {formatMoney(item.balanceBefore)}</p>

              <p className="mt-1 font-bold text-emerald-400">
                After: {formatMoney(item.balanceAfter)}
              </p>
            </td>

            <td className="px-4 py-4">
              <StatusBadge status={item.status} />
            </td>

            <td className="whitespace-nowrap px-4 py-4">
              {formatDate(item.claimedAt || item.createdAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ======================================================
   WHEEL SPIN DESKTOP TABLE
====================================================== */

const WheelDesktopTable = ({
  history,
  resolveImage,
  formatMoney,
  formatNumber,
  formatDate,
  getWheelTitle,
  getWheelImage,
  getPrizeTypeLabel,
  getWheelPrizeAmount,
  getUserName,
  getUserIdentity,
}) => (
  <div className="hidden overflow-x-auto rounded-2xl border border-yellow-700/40 bg-black/60 shadow-xl md:block">
    <table className="w-full min-w-[1350px]">
      <thead className="bg-gradient-to-r from-yellow-600 to-amber-500 text-black">
        <tr className="text-left text-xs font-extrabold uppercase">
          <th className="px-4 py-4">User</th>
          <th className="px-4 py-4">Wheel</th>
          <th className="px-4 py-4">Spin ID</th>
          <th className="px-4 py-4">Position</th>
          <th className="px-4 py-4">Prize Type</th>
          <th className="px-4 py-4">Prize</th>
          <th className="px-4 py-4">Coin Wallet</th>
          <th className="px-4 py-4">Balance</th>
          <th className="px-4 py-4">Turnover</th>
          <th className="px-4 py-4">Status</th>
          <th className="px-4 py-4">Spun At</th>
        </tr>
      </thead>

      <tbody>
        {history.map((item) => (
          <tr
            key={item._id}
            className="border-t border-yellow-800/25 text-xs text-yellow-100/75 transition hover:bg-yellow-950/35"
          >
            <td className="px-4 py-4">
              <UserDetails
                name={getUserName(item)}
                identity={getUserIdentity(item)}
              />
            </td>

            <td className="px-4 py-4">
              <div className="flex min-w-[190px] items-center gap-3">
                <img
                  src={resolveImage(getWheelImage(item))}
                  alt={getWheelTitle(item)}
                  className="h-12 w-20 rounded-lg border border-yellow-700/40 bg-black/40 object-contain"
                />

                <div>
                  <p className="line-clamp-2 font-bold text-yellow-100">
                    {getWheelTitle(item)}
                  </p>

                  <p className="mt-1 text-[10px] text-yellow-300/50">
                    Cost: {formatNumber(item.spinCost)} Coins
                  </p>
                </div>
              </div>
            </td>

            <td className="px-4 py-4">
              <p className="max-w-[130px] truncate font-mono text-[10px] text-cyan-300">
                {item.spinId || "—"}
              </p>
            </td>

            <td className="px-4 py-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 font-black text-black">
                {item.selectedPosition || "—"}
              </span>
            </td>

            <td className="px-4 py-4">
              <PrizeTypeBadge
                prizeType={item.prizeSnapshot?.prizeType}
                label={getPrizeTypeLabel(item)}
              />
            </td>

            <td className="px-4 py-4 font-extrabold text-yellow-300">
              {getWheelPrizeAmount(item)}
            </td>

            <td className="px-4 py-4">
              <p>Before: {formatNumber(item.rewardCoinBefore)}</p>

              <p className="mt-1 text-red-300">
                Cost: -{formatNumber(item.spinCost)}
              </p>

              <p className="mt-1 font-bold text-emerald-400">
                After: {formatNumber(item.rewardCoinAfter)}
              </p>
            </td>

            <td className="px-4 py-4">
              <p>Before: {formatMoney(item.balanceBefore)}</p>

              <p className="mt-1 font-bold text-emerald-400">
                After: {formatMoney(item.balanceAfter)}
              </p>
            </td>

            <td className="px-4 py-4">
              <p className="font-bold text-white">
                {item.turnoverMultiplier || 0}x
              </p>

              <p className="mt-1 text-[10px] text-yellow-200/45">
                {formatMoney(item.turnoverRequired)}
              </p>
            </td>

            <td className="px-4 py-4">
              <StatusBadge status={item.status} />
            </td>

            <td className="whitespace-nowrap px-4 py-4">
              {formatDate(item.spunAt || item.createdAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ======================================================
   MOBILE CARDS
====================================================== */

const RewardMobileCards = ({
  history,
  resolveImage,
  formatMoney,
  formatDate,
  getRewardTitle,
  getRewardImage,
  getCondition,
  getPeriod,
  getUserName,
  getUserIdentity,
}) => (
  <div className="grid grid-cols-1 gap-4 md:hidden">
    {history.map((item) => (
      <div
        key={item._id}
        className="rounded-2xl border border-yellow-700/40 bg-black/60 p-4 shadow-lg"
      >
        <div className="flex gap-3">
          <img
            src={resolveImage(getRewardImage(item))}
            alt={getRewardTitle(item)}
            className="h-16 w-24 shrink-0 rounded-xl border border-yellow-700/40 object-cover"
          />

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-bold text-yellow-100">
              {getRewardTitle(item)}
            </h3>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusBadge status={item.status} />

              <SmallBadge text={getCondition(item)} />

              <SmallBadge text={getPeriod(item)} />
            </div>
          </div>
        </div>

        <MobileUser name={getUserName(item)} identity={getUserIdentity(item)} />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <MobileInfo
            label="Achieved"
            value={formatMoney(item.achievedAmount)}
          />

          <MobileInfo label="Reward" value={formatMoney(item.rewardAmount)} />

          <MobileInfo
            label="Turnover"
            value={`${item.turnoverMultiplier || 0}x`}
          />

          <MobileInfo
            label="Balance After"
            value={formatMoney(item.balanceAfter)}
          />
        </div>

        <HistoryDate value={formatDate(item.claimedAt || item.createdAt)} />
      </div>
    ))}
  </div>
);

const WheelMobileCards = ({
  history,
  resolveImage,
  formatMoney,
  formatNumber,
  formatDate,
  getWheelTitle,
  getWheelImage,
  getPrizeTypeLabel,
  getWheelPrizeAmount,
  getUserName,
  getUserIdentity,
}) => (
  <div className="grid grid-cols-1 gap-4 md:hidden">
    {history.map((item) => (
      <div
        key={item._id}
        className="rounded-2xl border border-yellow-700/40 bg-black/60 p-4 shadow-lg"
      >
        <div className="flex gap-3">
          <img
            src={resolveImage(getWheelImage(item))}
            alt={getWheelTitle(item)}
            className="h-20 w-24 shrink-0 rounded-xl border border-yellow-700/40 bg-black/40 object-contain"
          />

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-bold text-yellow-100">
              {getWheelTitle(item)}
            </h3>

            <p className="mt-1 truncate font-mono text-[9px] text-cyan-300">
              {item.spinId}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusBadge status={item.status} />

              <PrizeTypeBadge
                prizeType={item.prizeSnapshot?.prizeType}
                label={getPrizeTypeLabel(item)}
              />

              <SmallBadge text={`Position ${item.selectedPosition || "—"}`} />
            </div>
          </div>
        </div>

        <MobileUser name={getUserName(item)} identity={getUserIdentity(item)} />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <MobileInfo label="Prize" value={getWheelPrizeAmount(item)} />

          <MobileInfo
            label="Spin Cost"
            value={`${formatNumber(item.spinCost)} Coins`}
          />

          <MobileInfo
            label="Coin After"
            value={`${formatNumber(item.rewardCoinAfter)} Coins`}
          />

          <MobileInfo
            label="Balance After"
            value={formatMoney(item.balanceAfter)}
          />

          <MobileInfo
            label="Turnover"
            value={formatMoney(item.turnoverRequired)}
          />

          <MobileInfo
            label="Multiplier"
            value={`${item.turnoverMultiplier || 0}x`}
          />
        </div>

        <HistoryDate value={formatDate(item.spunAt || item.createdAt)} />
      </div>
    ))}
  </div>
);

/* ======================================================
   SMALL COMPONENTS
====================================================== */

const SummaryCard = ({ label, value, icon }) => (
  <div className="rounded-xl border border-yellow-700/40 bg-black/60 p-4 shadow-lg">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/15 text-lg text-yellow-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase text-yellow-200/50">
          {label}
        </p>

        <p className="mt-1 truncate text-base font-extrabold text-white lg:text-xl">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const UserDetails = ({ name, identity }) => (
  <div className="min-w-[150px]">
    <p className="font-bold text-white">{name}</p>

    <p className="mt-1 text-[10px] text-yellow-200/45">{identity}</p>
  </div>
);

const MobileUser = ({ name, identity }) => (
  <div className="mt-4 rounded-xl border border-yellow-800/30 bg-yellow-950/20 p-3">
    <p className="text-xs font-bold text-white">{name}</p>

    <p className="mt-1 text-[10px] text-yellow-100/50">{identity}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const values = {
    claimed: {
      text: "Claimed",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },

    completed: {
      text: "Completed",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },

    processing: {
      text: "Processing",
      className: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    },

    failed: {
      text: "Failed",
      className: "bg-red-500/15 text-red-400 border-red-500/30",
    },
  };

  const value = values[status] || values.processing;

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-extrabold ${value.className}`}
    >
      {value.text}
    </span>
  );
};

const PrizeTypeBadge = ({ prizeType, label }) => {
  const classes = {
    balance: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",

    reward_coin: "border-yellow-500/30 bg-yellow-500/15 text-yellow-300",

    no_prize: "border-gray-500/30 bg-gray-500/15 text-gray-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-extrabold ${
        classes[prizeType] || classes.no_prize
      }`}
    >
      {label}
    </span>
  );
};

const SmallBadge = ({ text }) => (
  <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold text-white/70">
    {text}
  </span>
);

const MobileInfo = ({ label, value }) => (
  <div className="rounded-lg border border-yellow-800/30 bg-yellow-950/20 p-2.5">
    <p className="text-[9px] font-medium text-yellow-100/40">{label}</p>

    <p className="mt-1 break-words text-[11px] font-bold text-yellow-100">
      {value}
    </p>
  </div>
);

const HistoryDate = ({ value }) => (
  <p className="mt-3 text-right text-[10px] text-yellow-100/45">{value}</p>
);

const EmptyHistory = ({ activeTab }) => (
  <div className="rounded-2xl border border-yellow-700/40 bg-black/50 p-12 text-center">
    {activeTab === "wheel-spin" ? (
      <FaTrophy className="mx-auto text-5xl text-yellow-500/60" />
    ) : (
      <FaGift className="mx-auto text-5xl text-yellow-500/60" />
    )}

    <h3 className="mt-4 text-lg font-bold text-yellow-200">
      {activeTab === "wheel-spin"
        ? "No Wheel Spin history found"
        : "No Reward claim history found"}
    </h3>
  </div>
);

const Pagination = ({ currentPage, totalPages, pageNumbers, goToPage }) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        className={`flex h-10 items-center justify-center rounded-lg px-3 text-sm ${
          currentPage === 1
            ? "cursor-not-allowed bg-gray-800 text-gray-600"
            : "cursor-pointer border border-yellow-700/50 bg-black/70 text-yellow-200 hover:bg-yellow-900/40"
        }`}
      >
        <FaChevronLeft size={12} />
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => goToPage(page)}
          className={`h-10 min-w-10 cursor-pointer rounded-lg px-2 text-sm font-bold ${
            currentPage === page
              ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black"
              : "border border-yellow-700/50 bg-black/70 text-yellow-200 hover:bg-yellow-900/40"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className={`flex h-10 items-center justify-center rounded-lg px-3 text-sm ${
          currentPage === totalPages
            ? "cursor-not-allowed bg-gray-800 text-gray-600"
            : "cursor-pointer border border-yellow-700/50 bg-black/70 text-yellow-200 hover:bg-yellow-900/40"
        }`}
      >
        <FaChevronRight size={12} />
      </button>
    </div>
  );
};

const HistoryLoading = () => (
  <div className="space-y-3">
    {Array.from({
      length: 6,
    }).map((_, index) => (
      <div
        key={index}
        className="flex items-center gap-4 rounded-xl border border-yellow-700/30 bg-black/50 p-4"
      >
        <div className="h-14 w-20 animate-pulse rounded-lg bg-yellow-900/30" />

        <div className="flex-1">
          <div className="h-4 w-1/2 animate-pulse rounded bg-yellow-900/30" />

          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-yellow-900/20" />
        </div>
      </div>
    ))}
  </div>
);

export default RewardStoreHistory;
