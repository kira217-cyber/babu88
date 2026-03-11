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
import {
  FaArrowTrendDown,
  FaArrowTrendUp,
  FaRotateLeft,
} from "react-icons/fa6";

const PAGE_SIZE = 20;

const BET_TYPES = [
  "all",
  "BET",
  "SETTLE",
  "CANCEL",
  "REFUND",
  "BONUS",
  "PROMO",
];

const STATUSES = [
  "all",
  "pending",
  "bet",
  "settled",
  "won",
  "lost",
  "push",
  "cancelled",
  "refunded",
  "error",
  "void",
];

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

const getStatusClass = (status) => {
  switch (status) {
    case "won":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
    case "lost":
      return "bg-rose-500/15 text-rose-300 border border-rose-500/30";
    case "refunded":
      return "bg-yellow-500/15 text-yellow-200 border border-yellow-500/30";
    case "settled":
      return "bg-blue-500/15 text-blue-300 border border-blue-500/30";
    case "pending":
      return "bg-gray-500/15 text-gray-300 border border-gray-500/30";
    case "cancelled":
    case "void":
    case "error":
      return "bg-orange-500/15 text-orange-300 border border-orange-500/30";
    default:
      return "bg-white/10 text-white border border-white/10";
  }
};

const getBetTypeClass = (type) => {
  switch (type) {
    case "BET":
      return "bg-sky-500/15 text-sky-300 border border-sky-500/30";
    case "SETTLE":
      return "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30";
    case "REFUND":
      return "bg-yellow-500/15 text-yellow-200 border border-yellow-500/30";
    case "CANCEL":
      return "bg-orange-500/15 text-orange-300 border border-orange-500/30";
    case "BONUS":
    case "PROMO":
      return "bg-purple-500/15 text-purple-300 border border-purple-500/30";
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

const MobileHistoryCard = ({ row, index, currentPage }) => {
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
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getBetTypeClass(
            row.bet_type,
          )}`}
        >
          {row.bet_type || "-"}
        </span>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
            row.status,
          )}`}
        >
          {row.status || "-"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-amber-200/70">Provider</p>
          <p className="text-white break-words">{row.provider_code || "-"}</p>
        </div>
        <div>
          <p className="text-amber-200/70">Game</p>
          <p className="text-white break-words">{row.game_code || "-"}</p>
        </div>
        <div>
          <p className="text-amber-200/70">Amount</p>
          <p className="text-white">{formatMoney(row.amount)}</p>
        </div>
        <div>
          <p className="text-amber-200/70">Win Amount</p>
          <p className="text-emerald-300">{formatMoney(row.win_amount)}</p>
        </div>
        <div>
          <p className="text-amber-200/70">Balance After</p>
          <p className="text-sky-300">{formatMoney(row.balance_after)}</p>
        </div>
        <div>
          <p className="text-amber-200/70">Round ID</p>
          <p className="text-white break-words">{row.round_id || "-"}</p>
        </div>
      </div>

      <div className="mt-3 border-t border-amber-900/30 pt-3">
        <p className="text-xs text-amber-200/70">Transaction ID</p>
        <p className="text-sm text-white break-all">
          {row.transaction_id || "-"}
        </p>
      </div>
    </div>
  );
};

const BetLogSingleUser = () => {
  const { id } = useParams();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    q: "",
    betType: "all",
    status: "all",
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
      betType: debouncedFilters.betType || "all",
      status: debouncedFilters.status || "all",
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
    betLossTotalAmount: Number(summary?.betLossTotalAmount ?? 0),
    betWinTotalAmount: Number(summary?.betWinTotalAmount ?? 0),
    refundAmount: Number(summary?.refundAmount ?? 0),
    allBetHistoryCount: Number(summary?.allBetHistoryCount ?? 0),
  };

  const safePageSummary = {
    pageCount: Number(pageSummary?.pageCount ?? 0),
    pageAmountTotal: Number(pageSummary?.pageAmountTotal ?? 0),
    pageWinTotal: Number(pageSummary?.pageWinTotal ?? 0),
    pageRefundTotal: Number(pageSummary?.pageRefundTotal ?? 0),
    pageLossTotal: Number(pageSummary?.pageLossTotal ?? 0),
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
      betType: "all",
      status: "all",
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
            এই user এর সব bet history, filter, search, summary এবং pagination
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

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard
          title="Bet Loss Total Amount"
          value={formatMoney(safeSummary.betLossTotalAmount)}
          icon={<FaArrowTrendDown />}
        />
        <SummaryCard
          title="Bet Win Total Amount"
          value={formatMoney(safeSummary.betWinTotalAmount)}
          icon={<FaArrowTrendUp />}
        />
        <SummaryCard
          title="Refund Amount"
          value={formatMoney(safeSummary.refundAmount)}
          icon={<FaRotateLeft />}
        />
        <SummaryCard
          title="All Bet History Count"
          value={formatMoney(safeSummary.allBetHistoryCount)}
          icon={<FaReceipt />}
        />
      </div>

      {/* Filters */}
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
                placeholder="provider / game / transaction / round id / status..."
                className="w-full rounded-xl border border-amber-900/50 bg-black/40 py-3 pl-10 pr-3 text-sm text-white placeholder-amber-200/40 outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-amber-200/80">
              Bet Type
            </label>
            <select
              value={filters.betType}
              onChange={(e) => handleChange("betType", e.target.value)}
              className="w-full rounded-xl border border-amber-900/50 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
            >
              {BET_TYPES.map((item) => (
                <option key={item} value={item} className="bg-black text-white">
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-amber-200/80">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full rounded-xl border border-amber-900/50 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/30"
            >
              {STATUSES.map((item) => (
                <option key={item} value={item} className="bg-black text-white">
                  {item}
                </option>
              ))}
            </select>
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

      {/* Desktop Table */}
      <div className="hidden xl:block mt-6 overflow-hidden rounded-2xl border border-amber-900/40 bg-black/20">
        <div className="overflow-x-auto">
          <table className="min-w-[1280px] w-full text-sm">
            <thead className="bg-amber-950/30 text-left text-amber-100">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Game</th>
                <th className="px-4 py-3">Bet Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Win Amount</th>
                <th className="px-4 py-3 text-right">Balance After</th>
                <th className="px-4 py-3">Transaction ID</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-12 text-center text-amber-200/80"
                  >
                    Loading bet logs...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-12 text-center text-amber-200/80"
                  >
                    No bet history found
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row._id || `${row.transaction_id}-${index}`}
                    className="border-t border-amber-900/20 hover:bg-amber-950/10 transition"
                  >
                    <td className="px-4 py-3 text-gray-200">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-200">
                      {formatDateTime(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-200">
                      {row.provider_code || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-200">
                      {row.game_code || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getBetTypeClass(
                          row.bet_type,
                        )}`}
                      >
                        {row.bet_type || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                          row.status,
                        )}`}
                      >
                        {row.status || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatMoney(row.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-300">
                      {formatMoney(row.win_amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-sky-300">
                      {formatMoney(row.balance_after)}
                    </td>
                    <td className="px-4 py-3 text-gray-200">
                      {row.transaction_id || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-amber-900/30 bg-amber-950/20 font-semibold text-white">
                  <td colSpan={5} className="px-4 py-4 text-right">
                    This Page Totals:
                  </td>
                  <td className="px-4 py-4 text-left">
                    Count: {formatMoney(safePageSummary.pageCount)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {formatMoney(safePageSummary.pageAmountTotal)}
                  </td>
                  <td className="px-4 py-4 text-right text-emerald-300">
                    {formatMoney(safePageSummary.pageWinTotal)}
                  </td>
                  <td className="px-4 py-4 text-right text-rose-300">
                    Loss: {formatMoney(safePageSummary.pageLossTotal)}
                  </td>
                  <td
                    colSpan={2}
                    className="px-4 py-4 text-left text-yellow-200"
                  >
                    Refund: {formatMoney(safePageSummary.pageRefundTotal)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Mobile / Tablet Cards */}
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
              key={row._id || `${row.transaction_id}-${index}`}
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
              <div className="rounded-xl bg-amber-950/20 border border-amber-900/30 p-3">
                <p className="text-amber-200/70">Count</p>
                <p className="text-white font-semibold">
                  {formatMoney(safePageSummary.pageCount)}
                </p>
              </div>
              <div className="rounded-xl bg-amber-950/20 border border-amber-900/30 p-3">
                <p className="text-amber-200/70">Amount Total</p>
                <p className="text-white font-semibold">
                  {formatMoney(safePageSummary.pageAmountTotal)}
                </p>
              </div>
              <div className="rounded-xl bg-amber-950/20 border border-amber-900/30 p-3">
                <p className="text-amber-200/70">Win Total</p>
                <p className="text-emerald-300 font-semibold">
                  {formatMoney(safePageSummary.pageWinTotal)}
                </p>
              </div>
              <div className="rounded-xl bg-amber-950/20 border border-amber-900/30 p-3">
                <p className="text-amber-200/70">Loss Total</p>
                <p className="text-rose-300 font-semibold">
                  {formatMoney(safePageSummary.pageLossTotal)}
                </p>
              </div>
              <div className="rounded-xl bg-amber-950/20 border border-amber-900/30 p-3 col-span-2">
                <p className="text-amber-200/70">Refund Total</p>
                <p className="text-yellow-200 font-semibold">
                  {formatMoney(safePageSummary.pageRefundTotal)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
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
