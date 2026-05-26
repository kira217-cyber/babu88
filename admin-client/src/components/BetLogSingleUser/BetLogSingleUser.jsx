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

const formatMoney = (value) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getResultClass = (type) => {
  switch (String(type || "").toLowerCase()) {
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

const SummaryCard = ({ title, value, icon }) => (
  <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#0f0f0f] to-[#1a1200] p-4 shadow-lg shadow-black/40">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-amber-200/75 text-sm">{title}</p>
        <h3 className="mt-2 text-xl md:text-2xl font-bold text-white break-words">
          {value}
        </h3>
      </div>
      <div className="h-11 w-11 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black flex items-center justify-center shadow-md shadow-amber-700/30">
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
}) => {
  return (
    <div>
      <p className="text-amber-200/70">{label}</p>
      <p
        className={`${valueClass} ${breakAll ? "break-all" : "break-words"} font-medium`}
      >
        {value || "-"}
      </p>
    </div>
  );
};

const MobileHistoryCard = ({ row, index, currentPage }) => {
  const net = Number(row.net_amount || 0);

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
        <Info label="Provider" value={row.provider} />
        <Info label="Game" value={row.gameName || row.game_uid} />
        <Info label="Bet Amount" value={formatMoney(row.bet_amount)} />
        <Info
          label="Win Amount"
          value={formatMoney(row.win_amount)}
          valueClass="text-emerald-300"
        />
        <Info
          label="Net"
          value={formatMoney(row.net_amount)}
          valueClass={
            net > 0
              ? "text-emerald-300"
              : net < 0
                ? "text-rose-300"
                : "text-blue-300"
          }
        />
        <Info
          label="Balance After"
          value={formatMoney(row.balance_after)}
          valueClass="text-sky-300"
        />
        <Info label="Play Name" value={row.userGamePlayName} />
        <Info label="Phone" value={row.phone} />
      </div>

      <div className="mt-3 border-t border-amber-900/30 pt-3 space-y-2">
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
  const cls =
    valueClass ||
    (green ? "text-emerald-300" : red ? "text-rose-300" : "text-white");

  return (
    <div className="rounded-xl bg-amber-950/20 border border-amber-900/30 p-3">
      <p className="text-amber-200/70">{label}</p>
      <p className={`${cls} font-semibold`}>{formatMoney(value)}</p>
    </div>
  );
};

const BetLogSingleUser = () => {
  const { id } = useParams();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    q: "",
    resultType: "all",
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
      providerCode: debouncedFilters.providerCode || undefined,
      from: debouncedFilters.from || undefined,
      to: debouncedFilters.to || undefined,
    }),
    [page, debouncedFilters],
  );

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["single-user-bet-logs", id, queryParams],
    queryFn: async () => {
      const res = await api.get(`/api/admin/users/${id}/bet-logs`, {
        params: queryParams,
      });
      return res.data;
    },
    enabled: !!id,
    placeholderData: (prev) => prev,
  });

  const rows = data?.data || [];
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
  };

  const safePageSummary = {
    pageCount: Number(pageSummary?.pageCount ?? 0),
    pageBetTotal: Number(pageSummary?.pageBetTotal ?? 0),
    pageWinTotal: Number(pageSummary?.pageWinTotal ?? 0),
    pageNetTotal: Number(pageSummary?.pageNetTotal ?? 0),
    pageWinProfit: Number(pageSummary?.pageWinProfit ?? 0),
    pageLossAmount: Number(pageSummary?.pageLossAmount ?? 0),
  };

  const totalPages = Number(pagination?.totalPages || 1);
  const currentPage = Number(pagination?.page || 1);
  const totalItems = Number(pagination?.total || 0);

  const pageButtons = useMemo(() => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setFilters({
      q: "",
      resultType: "all",
      providerCode: "",
      from: "",
      to: "",
    });
    setPage(1);
  };

  return (
    <div className="mt-6 rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#0f0f0f] to-[#1a1200] p-4 sm:p-5 lg:p-6 shadow-lg shadow-black/40 text-white">
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
          onClick={() => refetch()}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-3 text-sm font-semibold text-black shadow-md shadow-amber-700/30 transition hover:from-amber-400 hover:to-yellow-400"
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
        <div className="mb-4 flex items-center gap-2 text-amber-300 font-semibold">
          <FaFilter />
          Search & Filters
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-5">
          <div className="2xl:col-span-2">
            <label className="mb-2 block text-sm text-amber-200/80">
              Search
            </label>

            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />

              <input
                type="text"
                value={filters.q}
                onChange={(e) => handleChange("q", e.target.value)}
                placeholder="game_uid / round / serial / member account..."
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
              onChange={(e) => handleChange("resultType", e.target.value)}
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
              Provider Code
            </label>

            <input
              type="text"
              value={filters.providerCode}
              onChange={(e) =>
                handleChange("providerCode", e.target.value.toUpperCase())
              }
              placeholder="JDB / PG"
              className="w-full rounded-xl border border-amber-900/50 bg-black/40 px-3 py-3 text-sm text-white placeholder-amber-200/40 outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div className="flex items-end">
            <button
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
              onChange={(e) => handleChange("from", e.target.value)}
              className="w-full rounded-xl border border-amber-900/50 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-amber-200/80">To</label>
            <input
              type="datetime-local"
              value={filters.to}
              onChange={(e) => handleChange("to", e.target.value)}
              className="w-full rounded-xl border border-amber-900/50 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>
      </div>

      <div className="hidden xl:block mt-6 overflow-hidden rounded-2xl border border-amber-900/40 bg-black/20">
        <div className="overflow-x-auto">
          <table className="min-w-[1650px] w-full text-sm">
            <thead className="bg-amber-950/30 text-left text-amber-100">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Time</th>
                {/* <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Game</th> */}
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3 text-right">Bet</th>
                <th className="px-4 py-3 text-right">Win</th>
                <th className="px-4 py-3 text-right">Net</th>
                <th className="px-4 py-3 text-right">Before</th>
                <th className="px-4 py-3 text-right">After</th>
                <th className="px-4 py-3">Game UID</th>
                <th className="px-4 py-3">Round</th>
                <th className="px-4 py-3">Serial</th>
                {/* <th className="px-4 py-3">Member Account</th> */}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={14}
                    className="px-4 py-12 text-center text-amber-200/80"
                  >
                    Loading bet logs...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="px-4 py-12 text-center text-amber-200/80"
                  >
                    No bet history found
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const net = Number(row.net_amount || 0);

                  return (
                    <tr
                      key={row._id || row.serial_number || index}
                      className="border-t border-amber-900/20 hover:bg-amber-950/10 transition"
                    >
                      <td className="px-4 py-3 text-gray-200">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-gray-200">
                        {formatDateTime(row.createdAt)}
                      </td>

                      {/* <td className="px-4 py-3 text-gray-200">
                        {row.provider || "-"}
                      </td>

                      <td className="px-4 py-3 text-gray-200">
                        <div className="font-medium text-white">
                          {row.gameName || row.game_uid || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {row.category || "-"}
                        </div>
                      </td> */}

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
                        {formatMoney(row.bet_amount)}
                      </td>

                      <td className="px-4 py-3 text-right text-emerald-300">
                        {formatMoney(row.win_amount)}
                      </td>

                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          net > 0
                            ? "text-emerald-300"
                            : net < 0
                              ? "text-rose-300"
                              : "text-blue-300"
                        }`}
                      >
                        {formatMoney(row.net_amount)}
                      </td>

                      <td className="px-4 py-3 text-right text-gray-200">
                        {formatMoney(row.balance_before)}
                      </td>

                      <td className="px-4 py-3 text-right text-sky-300">
                        {formatMoney(row.balance_after)}
                      </td>

                      <td className="px-4 py-3 text-gray-200 break-all">
                        {row.game_uid || "-"}
                      </td>

                      <td className="px-4 py-3 text-gray-200 break-all">
                        {row.game_round || "-"}
                      </td>

                      <td className="px-4 py-3 text-gray-200 break-all">
                        {row.serial_number || "-"}
                      </td>

                      {/* <td className="px-4 py-3 text-gray-200 break-all">
                        {row.member_account || "-"}
                      </td> */}
                    </tr>
                  );
                })
              )}
            </tbody>

            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-amber-900/30 bg-amber-950/20 font-semibold text-white">
                  <td colSpan={5} className="px-4 py-4 text-right">
                    This Page Totals:
                  </td>

                  <td className="px-4 py-4 text-right">
                    {formatMoney(safePageSummary.pageBetTotal)}
                  </td>

                  <td className="px-4 py-4 text-right text-emerald-300">
                    {formatMoney(safePageSummary.pageWinTotal)}
                  </td>

                  <td
                    className={`px-4 py-4 text-right ${
                      safePageSummary.pageNetTotal > 0
                        ? "text-emerald-300"
                        : safePageSummary.pageNetTotal < 0
                          ? "text-rose-300"
                          : "text-blue-300"
                    }`}
                  >
                    {formatMoney(safePageSummary.pageNetTotal)}
                  </td>

                  <td colSpan={6} className="px-4 py-4 text-left">
                    Count: {formatMoney(safePageSummary.pageCount)} | Win
                    Profit: {formatMoney(safePageSummary.pageWinProfit)} | Loss:
                    {formatMoney(safePageSummary.pageLossAmount)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <div className="xl:hidden mt-6 space-y-4">
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
            <h3 className="text-white font-semibold mb-3">This Page Totals</h3>

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
                valueClass={
                  safePageSummary.pageNetTotal > 0
                    ? "text-emerald-300"
                    : safePageSummary.pageNetTotal < 0
                      ? "text-rose-300"
                      : "text-blue-300"
                }
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
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="rounded-2xl border border-amber-900/40 bg-black/20 px-4 py-3 text-sm text-amber-100 shadow-md">
          Total:{" "}
          <span className="text-white font-semibold">
            {formatMoney(totalItems)}
          </span>
          <span className="mx-2 text-amber-400/70">|</span>
          Page: <span className="text-white font-semibold">{currentPage}</span>
          <span className="mx-1 text-amber-400/70">/</span>
          <span className="text-white font-semibold">{totalPages}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={currentPage <= 1}
            className="rounded-xl border border-amber-900/40 bg-black/30 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            First
          </button>

          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-900/40 bg-black/30 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaChevronLeft />
            Prev
          </button>

          {pageButtons.map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`min-w-[42px] rounded-xl px-3 py-2 text-sm font-medium transition ${
                num === currentPage
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md shadow-amber-700/30"
                  : "border border-amber-900/40 bg-black/30 text-white hover:bg-white/10"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-900/40 bg-black/30 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <FaChevronRight />
          </button>

          <button
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
