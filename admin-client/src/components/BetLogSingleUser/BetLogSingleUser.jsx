import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import {
  FaSearch,
  FaSyncAlt,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaReceipt,
} from "react-icons/fa";
import { FaArrowTrendDown, FaArrowTrendUp, FaTrophy } from "react-icons/fa6";

const PAGE_SIZE = 20;

const RESULT_TYPES = ["all", "win", "loss", "push"];

const PROVIDER_TYPES = [
  {
    value: "all",
    label: "All Providers",
  },
  {
    value: "oracle",
    label: "Oracle",
  },
  {
    value: "ninewicket",
    label: "NineWicket",
  },
];

const formatMoney = (value) => {
  const num = Number(value ?? 0);

  if (!Number.isFinite(num)) {
    return "0";
  }

  return num.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getResultClass = (type) => {
  switch (
    String(type || "")
      .trim()
      .toLowerCase()
  ) {
    case "win":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";

    case "loss":
      return "bg-rose-500/15 text-rose-300 border border-rose-500/30";

    case "push":
      return "bg-blue-500/15 text-blue-300 border border-blue-500/30";

    default:
      return "bg-white/10 text-white border border-white/10";
  }
};

const getNetClass = (value) => {
  const amount = Number(value || 0);

  if (amount > 0) {
    return "text-emerald-300";
  }

  if (amount < 0) {
    return "text-rose-300";
  }

  return "text-blue-300";
};

const isNineWicketRow = (row) => {
  const provider = String(row?.provider || row?.displayProviderName || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  return (
    provider === "ninewicket" ||
    Boolean(row?.isNineWicket) ||
    Boolean(row?.nineWicketUsername) ||
    Boolean(row?.nineWicketBetId)
  );
};

const getProviderName = (row) => {
  if (isNineWicketRow(row)) {
    return "NineWicket";
  }

  return (
    row?.displayProviderName ||
    row?.providerName ||
    row?.providerCode ||
    row?.provider ||
    "Oracle"
  );
};

const getDisplayUsername = (row) => {
  if (isNineWicketRow(row)) {
    return (
      row?.displayUsername ||
      row?.nineWicketUsername ||
      row?.member_account ||
      "-"
    );
  }

  return (
    row?.displayUsername || row?.userGamePlayName || row?.member_account || "-"
  );
};

const getGameName = (row) => {
  if (isNineWicketRow(row)) {
    return (
      row?.eventName ||
      row?.displayGameName ||
      row?.competitionName ||
      "NineWicket"
    );
  }

  return (
    row?.displayGameName ||
    row?.gameName ||
    row?.oracleGameName ||
    row?.game_uid ||
    "-"
  );
};

const getGameSubtitle = (row) => {
  if (isNineWicketRow(row)) {
    return (
      row?.displayGameSubtitle ||
      [row?.eventTypeName, row?.competitionName, row?.marketName]
        .filter(Boolean)
        .join(" • ") ||
      "-"
    );
  }

  return row?.category || row?.providerName || row?.providerCode || "-";
};

const getDisplayBetAmount = (row) => {
  if (isNineWicketRow(row)) {
    return Number(
      row?.displayBetAmount ?? row?.matchStake ?? row?.bet_amount ?? 0,
    );
  }

  return Number(row?.bet_amount || 0);
};

const getTextValue = (value) => {
  const text = String(value ?? "").trim();

  return text || "-";
};

const SummaryCard = ({ title, value, icon }) => (
  <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#0f0f0f] to-[#1a1200] p-4 shadow-lg shadow-black/40">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-amber-200/75">{title}</p>

        <h3 className="mt-2 break-words text-xl font-bold text-white md:text-2xl">
          {value}
        </h3>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md shadow-amber-700/30">
        {icon}
      </div>
    </div>
  </div>
);

const Info = ({
  label,
  value,
  valueClass = "text-white",
  breakAll = false,
}) => (
  <div>
    <p className="text-amber-200/70">{label}</p>

    <p
      className={`${valueClass} ${
        breakAll ? "break-all" : "break-words"
      } font-medium`}
    >
      {value !== undefined && value !== null && String(value).trim() !== ""
        ? value
        : "-"}
    </p>
  </div>
);

const MobileHistoryCard = ({ row, index, currentPage }) => {
  const nineWicket = isNineWicketRow(row);

  return (
    <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#0f0f0f] to-[#1a1200] p-4 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-amber-300">
          #{(currentPage - 1) * PAGE_SIZE + index + 1}
        </span>

        <span className="text-xs text-amber-200/70">
          {formatDateTime(row.createdAt)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getResultClass(
            row.resultType,
          )}`}
        >
          {row.resultType || "-"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Info label="Provider" value={getProviderName(row)} />

        <Info label="Game" value={getGameName(row)} />

        <Info
          label={nineWicket ? "NineWicket Username" : "Play Name"}
          value={getDisplayUsername(row)}
        />

        <Info label="Phone" value={row.phone} />

        {nineWicket && (
          <>
            <Info label="Event Type Name" value={row.eventTypeName} />

            <Info label="Event Name" value={row.eventName} />

            <Info label="Market Name" value={row.marketName} />

            <Info label="Competition Name" value={row.competitionName} />

            <Info label="Match Stake" value={formatMoney(row.matchStake)} />

            <Info
              label="Profit/Loss"
              value={formatMoney(row.profitLoss)}
              valueClass={getNetClass(row.profitLoss)}
            />

            <Info label="Bet Status" value={row.nineWicketBetStatus} />

            <Info
              label="Exposure Change"
              value={formatMoney(row.exposureChange)}
              valueClass={getNetClass(row.exposureChange)}
            />

            <Info
              label="Exposure After"
              value={formatMoney(row.exposureAfter)}
              valueClass="text-sky-300"
            />
          </>
        )}

        <Info
          label="Bet Amount"
          value={formatMoney(getDisplayBetAmount(row))}
        />

        <Info
          label="Win Amount"
          value={formatMoney(row.win_amount)}
          valueClass="text-emerald-300"
        />

        <Info
          label="Net"
          value={formatMoney(row.net_amount)}
          valueClass={getNetClass(row.net_amount)}
        />

        <Info label="Balance Before" value={formatMoney(row.balance_before)} />

        <Info
          label="Balance After"
          value={formatMoney(row.balance_after)}
          valueClass="text-sky-300"
        />
      </div>

      <div className="mt-3 space-y-2 border-t border-amber-900/30 pt-3">
        <Info label="Game UID" value={row.game_uid} breakAll />

        <Info label="Game Round" value={row.game_round} breakAll />

        <Info label="Serial Number" value={row.serial_number} breakAll />

        <Info label="Member Account" value={row.member_account} breakAll />
      </div>
    </div>
  );
};

const PageTotal = ({
  label,
  value,
  green = false,
  red = false,
  valueClass = "",
}) => {
  let className = "text-white";

  if (valueClass) {
    className = valueClass;
  } else if (green) {
    className = "text-emerald-300";
  } else if (red) {
    className = "text-rose-300";
  }

  return (
    <div className="rounded-xl border border-amber-900/30 bg-amber-950/20 p-3">
      <p className="text-amber-200/70">{label}</p>

      <p className={`${className} font-semibold`}>{formatMoney(value)}</p>
    </div>
  );
};

const BetLogSingleUser = () => {
  const { id } = useParams();

  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    q: "",
    resultType: "all",
    provider: "all",
    providerCode: "",
    from: "",
    to: "",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 350);

    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilters, id]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,

      q: debouncedFilters.q || undefined,

      resultType: debouncedFilters.resultType || "all",

      provider: debouncedFilters.provider || "all",

      providerCode:
        debouncedFilters.provider === "ninewicket"
          ? undefined
          : debouncedFilters.providerCode || undefined,

      from: debouncedFilters.from || undefined,

      to: debouncedFilters.to || undefined,
    }),
    [page, debouncedFilters],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["single-user-bet-logs", id, queryParams],

    queryFn: async () => {
      const response = await api.get(`/api/admin/users/${id}/bet-logs`, {
        params: queryParams,
      });

      return response.data;
    },

    enabled: Boolean(id),

    placeholderData: (previous) => previous,
  });

  const rows = Array.isArray(data?.data) ? data.data : [];

  const pagination = data?.pagination || {};

  const summary = data?.summary || {};

  const pageSummary = data?.pageSummary || {};

  const safeSummary = {
    allBetHistoryCount: Number(summary?.allBetHistoryCount ?? 0),

    totalBetAmount: Number(summary?.totalBetAmount ?? 0),

    totalWinAmount: Number(summary?.totalWinAmount ?? 0),

    totalNetAmount: Number(summary?.totalNetAmount ?? 0),

    totalWinProfit: Number(summary?.totalWinProfit ?? 0),

    totalLossAmount: Number(summary?.totalLossAmount ?? 0),

    winCount: Number(summary?.winCount ?? 0),

    lossCount: Number(summary?.lossCount ?? 0),

    pushCount: Number(summary?.pushCount ?? 0),

    totalMatchStake: Number(summary?.totalMatchStake ?? 0),

    totalNineWicketProfitLoss: Number(summary?.totalNineWicketProfitLoss ?? 0),

    totalExposureChange: Number(summary?.totalExposureChange ?? 0),

    oracleCount: Number(summary?.oracleCount ?? 0),

    nineWicketCount: Number(summary?.nineWicketCount ?? 0),
  };

  const safePageSummary = {
    pageCount: Number(pageSummary?.pageCount ?? 0),

    pageBetTotal: Number(pageSummary?.pageBetTotal ?? 0),

    pageWinTotal: Number(pageSummary?.pageWinTotal ?? 0),

    pageNetTotal: Number(pageSummary?.pageNetTotal ?? 0),

    pageWinProfit: Number(pageSummary?.pageWinProfit ?? 0),

    pageLossAmount: Number(pageSummary?.pageLossAmount ?? 0),

    pageMatchStake: Number(pageSummary?.pageMatchStake ?? 0),

    pageNineWicketProfitLoss: Number(
      pageSummary?.pageNineWicketProfitLoss ?? 0,
    ),

    pageExposureChange: Number(pageSummary?.pageExposureChange ?? 0),
  };

  const totalPages = Number(pagination?.totalPages || 1);

  const currentPage = Number(pagination?.page || 1);

  const totalItems = Number(pagination?.total || 0);

  const pageButtons = useMemo(() => {
    const pages = [];

    const start = Math.max(1, currentPage - 2);

    const end = Math.min(totalPages, currentPage + 2);

    for (let index = start; index <= end; index += 1) {
      pages.push(index);
    }

    return pages;
  }, [currentPage, totalPages]);

  const handleChange = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleProviderChange = (value) => {
    setFilters((previous) => ({
      ...previous,

      provider: value,

      providerCode: value === "ninewicket" ? "" : previous.providerCode,
    }));
  };

  const handleReset = () => {
    setFilters({
      q: "",
      resultType: "all",
      provider: "all",
      providerCode: "",
      from: "",
      to: "",
    });

    setPage(1);
  };

  return (
    <div className="mt-6 rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#0f0f0f] to-[#1a1200] p-4 text-white shadow-lg shadow-black/40 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-amber-100">
            Single User Bet Logs
          </h2>

          <p className="mt-1 text-sm text-amber-200/70">
            এই user এর game result history, filter, search, summary এবং
            pagination
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3 text-sm font-semibold text-black shadow-md shadow-amber-700/30 transition hover:from-amber-400 hover:to-yellow-400 sm:w-auto"
        >
          <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
          Reload
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard
          title="Total Bet Amount"
          value={formatMoney(safeSummary.totalBetAmount)}
          icon={<FaArrowTrendDown />}
        />

        <SummaryCard
          title="Total Win Amount"
          value={formatMoney(safeSummary.totalWinAmount)}
          icon={<FaArrowTrendUp />}
        />

        <SummaryCard
          title="Total Loss Amount"
          value={formatMoney(safeSummary.totalLossAmount)}
          icon={<FaArrowTrendDown />}
        />

        <SummaryCard
          title="All Bet History Count"
          value={formatMoney(safeSummary.allBetHistoryCount)}
          icon={<FaReceipt />}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard
          title="Net Total"
          value={formatMoney(safeSummary.totalNetAmount)}
          icon={<FaReceipt />}
        />

        <SummaryCard
          title="Win Profit"
          value={formatMoney(safeSummary.totalWinProfit)}
          icon={<FaTrophy />}
        />

        <SummaryCard
          title="Win Count"
          value={formatMoney(safeSummary.winCount)}
          icon={<FaArrowTrendUp />}
        />

        <SummaryCard
          title="Loss Count"
          value={formatMoney(safeSummary.lossCount)}
          icon={<FaArrowTrendDown />}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-amber-900/40 bg-black/25 p-4">
        <div className="mb-4 flex items-center gap-2 font-semibold text-amber-300">
          <FaFilter />
          Search & Filters
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-6">
          <div className="2xl:col-span-2">
            <label className="mb-2 block text-sm text-amber-200/80">
              Search
            </label>

            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />

              <input
                type="text"
                value={filters.q}
                onChange={(event) => handleChange("q", event.target.value)}
                placeholder="game / event / round / serial / member account..."
                className="w-full rounded-xl border border-amber-900/50 bg-black/40 py-3 pl-10 pr-3 text-sm text-white placeholder-amber-200/40 outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-amber-200/80">
              Result Type
            </label>

            <select
              value={filters.resultType}
              onChange={(event) =>
                handleChange("resultType", event.target.value)
              }
              className="w-full rounded-xl border border-amber-900/50 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
            >
              {RESULT_TYPES.map((item) => (
                <option key={item} value={item} className="bg-black text-white">
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-amber-200/80">
              Provider
            </label>

            <select
              value={filters.provider}
              onChange={(event) => handleProviderChange(event.target.value)}
              className="w-full rounded-xl border border-amber-900/50 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
            >
              {PROVIDER_TYPES.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                  className="bg-black text-white"
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-amber-200/80">
              Provider Code
            </label>

            <input
              type="text"
              value={filters.providerCode}
              onChange={(event) =>
                handleChange("providerCode", event.target.value.toUpperCase())
              }
              placeholder="JDB / PG"
              disabled={filters.provider === "ninewicket"}
              className="w-full rounded-xl border border-amber-900/50 bg-black/40 px-3 py-3 text-sm text-white placeholder-amber-200/40 outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-amber-200/80">From</label>

            <input
              type="datetime-local"
              value={filters.from}
              onChange={(event) => handleChange("from", event.target.value)}
              className="w-full rounded-xl border border-amber-900/50 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-amber-200/80">To</label>

            <input
              type="datetime-local"
              value={filters.to}
              onChange={(event) => handleChange("to", event.target.value)}
              className="w-full rounded-xl border border-amber-900/50 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>
      </div>

      {/* =================================================
          DESKTOP TABLE
      ================================================= */}

      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-amber-900/40 bg-black/20 xl:block">
        <div className="overflow-x-auto">
          <table className="min-w-[2550px] w-full text-sm">
            <thead className="bg-amber-950/30 text-left text-amber-100">
              <tr>
                <th className="px-4 py-3">#</th>

                <th className="px-4 py-3">Time</th>

                <th className="px-4 py-3">Provider</th>

                <th className="px-4 py-3">Play Name</th>

                <th className="px-4 py-3">Game</th>

                <th className="px-4 py-3">Result</th>

                <th className="px-4 py-3 text-right">Bet</th>

                <th className="px-4 py-3 text-right">Win</th>

                <th className="px-4 py-3 text-right">Net</th>

                <th className="px-4 py-3 text-right">Before</th>

                <th className="px-4 py-3 text-right">After</th>

                <th className="px-4 py-3 text-right">Match Stake</th>

                <th className="px-4 py-3 text-right">Profit/Loss</th>

                <th className="px-4 py-3">Bet Status</th>

                <th className="px-4 py-3 text-right">Exposure Change</th>

                <th className="px-4 py-3 text-right">Exposure After</th>

                <th className="px-4 py-3">Game UID</th>

                <th className="px-4 py-3">Round</th>

                <th className="px-4 py-3">Serial</th>

                <th className="px-4 py-3">Member Account</th>

                <th className="px-4 py-3">Event Type Name</th>

                <th className="px-4 py-3">Event Name</th>

                <th className="px-4 py-3">Market Name</th>

                <th className="px-4 py-3">Competition Name</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={24}
                    className="px-4 py-12 text-center text-amber-200/80"
                  >
                    Loading bet logs...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={24}
                    className="px-4 py-12 text-center text-amber-200/80"
                  >
                    No bet history found
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const nineWicket = isNineWicketRow(row);

                  return (
                    <tr
                      key={row._id || row.serial_number || index}
                      className="border-t border-amber-900/20 transition hover:bg-amber-950/10"
                    >
                      <td className="px-4 py-3 text-gray-200">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-gray-200">
                        {formatDateTime(row.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-gray-200">
                        {getProviderName(row)}
                      </td>

                      <td className="px-4 py-3 text-gray-200">
                        <div>{getDisplayUsername(row)}</div>

                        <div className="text-xs text-gray-500">
                          {row.phone || "-"}
                        </div>
                      </td>

                      <td className="min-w-[180px] px-4 py-3 text-gray-200">
                        <div className="font-medium text-white">
                          {getGameName(row)}
                        </div>

                        <div className="text-xs text-gray-500">
                          {getGameSubtitle(row)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getResultClass(
                            row.resultType,
                          )}`}
                        >
                          {row.resultType || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right text-white">
                        {formatMoney(getDisplayBetAmount(row))}
                      </td>

                      <td className="px-4 py-3 text-right text-emerald-300">
                        {formatMoney(row.win_amount)}
                      </td>

                      <td
                        className={`px-4 py-3 text-right font-semibold ${getNetClass(
                          row.net_amount,
                        )}`}
                      >
                        {formatMoney(row.net_amount)}
                      </td>

                      <td className="px-4 py-3 text-right text-gray-200">
                        {formatMoney(row.balance_before)}
                      </td>

                      <td className="px-4 py-3 text-right text-sky-300">
                        {formatMoney(row.balance_after)}
                      </td>

                      <td className="px-4 py-3 text-right text-white">
                        {nineWicket ? formatMoney(row.matchStake) : "-"}
                      </td>

                      <td
                        className={`px-4 py-3 text-right ${
                          nineWicket
                            ? getNetClass(row.profitLoss)
                            : "text-gray-500"
                        }`}
                      >
                        {nineWicket ? formatMoney(row.profitLoss) : "-"}
                      </td>

                      <td className="px-4 py-3 text-gray-200">
                        {nineWicket
                          ? getTextValue(row.nineWicketBetStatus)
                          : "-"}
                      </td>

                      <td
                        className={`px-4 py-3 text-right ${
                          nineWicket
                            ? getNetClass(row.exposureChange)
                            : "text-gray-500"
                        }`}
                      >
                        {nineWicket ? formatMoney(row.exposureChange) : "-"}
                      </td>

                      <td className="px-4 py-3 text-right text-sky-300">
                        {nineWicket ? formatMoney(row.exposureAfter) : "-"}
                      </td>

                      <td className="min-w-[230px] break-all px-4 py-3 text-gray-200">
                        {row.game_uid || "-"}
                      </td>

                      <td className="min-w-[180px] break-all px-4 py-3 text-gray-200">
                        {row.game_round || "-"}
                      </td>

                      <td className="min-w-[220px] break-all px-4 py-3 text-gray-200">
                        {row.serial_number || "-"}
                      </td>

                      <td className="min-w-[150px] break-all px-4 py-3 text-gray-200">
                        {row.member_account || "-"}
                      </td>

                      <td className="min-w-[150px] px-4 py-3 text-gray-200">
                        {nineWicket ? getTextValue(row.eventTypeName) : "-"}
                      </td>

                      <td className="min-w-[220px] px-4 py-3 text-gray-200">
                        {nineWicket ? getTextValue(row.eventName) : "-"}
                      </td>

                      <td className="min-w-[160px] px-4 py-3 text-gray-200">
                        {nineWicket ? getTextValue(row.marketName) : "-"}
                      </td>

                      <td className="min-w-[170px] px-4 py-3 text-gray-200">
                        {nineWicket ? getTextValue(row.competitionName) : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-amber-900/30 bg-amber-950/20 font-semibold text-white">
                  <td colSpan={10} className="px-4 py-4 text-right">
                    This Page Totals:
                  </td>

                  <td className="px-4 py-4 text-right">
                    {formatMoney(safePageSummary.pageBetTotal)}
                  </td>

                  <td className="px-4 py-4 text-right text-emerald-300">
                    {formatMoney(safePageSummary.pageWinTotal)}
                  </td>

                  <td
                    className={`px-4 py-4 text-right ${getNetClass(
                      safePageSummary.pageNetTotal,
                    )}`}
                  >
                    {formatMoney(safePageSummary.pageNetTotal)}
                  </td>

                  <td colSpan={11} className="px-4 py-4 text-left">
                    Count: {formatMoney(safePageSummary.pageCount)} | Win
                    Profit: {formatMoney(safePageSummary.pageWinProfit)} | Loss:{" "}
                    {formatMoney(safePageSummary.pageLossAmount)} | Match Stake:{" "}
                    {formatMoney(safePageSummary.pageMatchStake)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* =================================================
          MOBILE CARDS
      ================================================= */}

      <div className="mt-6 space-y-4 xl:hidden">
        {isLoading ? (
          <div className="rounded-2xl border border-amber-900/40 bg-black/25 p-8 text-center text-amber-200/80">
            Loading bet logs...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-amber-900/40 bg-black/25 p-8 text-center text-amber-200/80">
            No bet history found
          </div>
        ) : (
          rows.map((row, index) => (
            <MobileHistoryCard
              key={row._id || row.serial_number || index}
              row={row}
              index={index}
              currentPage={currentPage}
            />
          ))
        )}

        {rows.length > 0 && (
          <div className="rounded-2xl border border-amber-900/40 bg-black/25 p-4">
            <h3 className="mb-3 font-semibold text-white">This Page Totals</h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <PageTotal label="Count" value={safePageSummary.pageCount} />

              <PageTotal
                label="Bet Total"
                value={safePageSummary.pageBetTotal}
              />

              <PageTotal
                label="Win Total"
                value={safePageSummary.pageWinTotal}
                green
              />

              <PageTotal
                label="Net Total"
                value={safePageSummary.pageNetTotal}
                valueClass={getNetClass(safePageSummary.pageNetTotal)}
              />

              <PageTotal
                label="Loss Amount"
                value={safePageSummary.pageLossAmount}
                red
              />

              <PageTotal
                label="Win Profit"
                value={safePageSummary.pageWinProfit}
                green
              />

              <PageTotal
                label="Match Stake"
                value={safePageSummary.pageMatchStake}
              />

              <PageTotal
                label="NineWicket P/L"
                value={safePageSummary.pageNineWicketProfitLoss}
                valueClass={getNetClass(
                  safePageSummary.pageNineWicketProfitLoss,
                )}
              />
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="rounded-2xl border border-amber-900/40 bg-black/20 px-4 py-3 text-sm text-amber-100 shadow-md">
          Total:{" "}
          <span className="font-semibold text-white">
            {formatMoney(totalItems)}
          </span>
          <span className="mx-2 text-amber-400/70">|</span>
          Page: <span className="font-semibold text-white">{currentPage}</span>
          <span className="mx-1 text-amber-400/70">/</span>
          <span className="font-semibold text-white">{totalPages}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={currentPage <= 1}
            className="rounded-xl border border-amber-900/40 bg-black/30 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            First
          </button>

          <button
            type="button"
            onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-900/40 bg-black/30 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronLeft />
            Prev
          </button>

          {pageButtons.map((number) => (
            <button
              type="button"
              key={number}
              onClick={() => setPage(number)}
              className={`min-w-[42px] rounded-xl px-3 py-2 text-sm font-medium transition ${
                number === currentPage
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md shadow-amber-700/30"
                  : "border border-amber-900/40 bg-black/30 text-white hover:bg-white/10"
              }`}
            >
              {number}
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              setPage((previous) => Math.min(previous + 1, totalPages))
            }
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-900/40 bg-black/30 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <FaChevronRight />
          </button>

          <button
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="rounded-xl border border-amber-900/40 bg-black/30 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Last
          </button>
        </div>
      </div>

      {isFetching && !isLoading && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-900/30 bg-amber-950/10 px-3 py-2 text-sm text-amber-200">
          <FaSyncAlt className="animate-spin" />
          Updating data...
        </div>
      )}
    </div>
  );
};

export default BetLogSingleUser;
