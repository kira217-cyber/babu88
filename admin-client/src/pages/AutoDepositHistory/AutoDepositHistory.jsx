import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  FaSearch,
  FaSyncAlt,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaFilter,
  FaReceipt,
  FaUser,
  FaPhoneAlt,
  FaCircle,
  FaGift,
  FaPercentage,
  FaMoneyBillWave,
  FaChartLine,
} from "react-icons/fa";

const money = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const statusChip = (status) => {
  const s = String(status || "PENDING").toUpperCase();
  if (s === "PAID")
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  if (s === "FAILED") return "bg-red-500/15 text-red-200 border-red-400/30";
  return "bg-yellow-500/15 text-yellow-200 border-yellow-400/30";
};

const statusDot = (status) => {
  const s = String(status || "PENDING").toUpperCase();
  if (s === "PAID") return "text-emerald-300";
  if (s === "FAILED") return "text-red-300";
  return "text-yellow-300";
};

const FieldRow = ({ k, v, noBorder = false }) => (
  <div
    className={`flex items-start justify-between gap-4 py-2 ${
      noBorder ? "" : "border-b border-yellow-700/20"
    }`}
  >
    <div className="text-[12px] font-bold text-yellow-100/70">{k}</div>
    <div className="text-[13px] font-extrabold text-white/90 text-right break-all">
      {v}
    </div>
  </div>
);

const Skeleton = () => (
  <div className="p-6 space-y-4">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="h-16 w-full rounded-xl bg-white/10 animate-pulse"
      />
    ))}
  </div>
);

const AutoDepositHistory = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState("");

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");

  const page = pagination.page;
  const limit = pagination.limit;
  const totalPages = pagination.totalPages;

  const fetchData = async ({
    page: p = page,
    limit: l = limit,
    query = q,
    statusValue = status,
  } = {}) => {
    try {
      if (!refreshing) setLoading(true);

      const params = { page: p, limit: l };
      if (query) params.q = query;
      if (statusValue && statusValue !== "ALL") params.status = statusValue;

      const { data } = await api.get("/api/auto-deposit/deposits/admin", {
        params,
      });

      if (!data?.success) throw new Error(data?.message || "Fetch failed");

      setRows(Array.isArray(data?.data) ? data.data : []);
      setPagination({
        page: data?.pagination?.page || p,
        limit: data?.pagination?.limit || l,
        total: data?.pagination?.total || 0,
        totalPages: data?.pagination?.totalPages || 1,
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Server error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData({ page: 1, query: "", statusValue: "ALL" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const query = qInput.trim();
    setQ(query);
    setExpandedId("");
    fetchData({ page: 1, query, statusValue: status });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setExpandedId("");
    await fetchData({ page, query: q, statusValue: status });
    toast.info("Refreshed");
  };

  const onChangeStatus = (val) => {
    setStatus(val);
    setExpandedId("");
    fetchData({ page: 1, query: q, statusValue: val });
  };

  const onPageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setExpandedId("");
    fetchData({ page: newPage, query: q, statusValue: status });
  };

  const onChangeLimit = (newLimit) => {
    setExpandedId("");
    fetchData({
      page: 1,
      limit: Number(newLimit || 20),
      query: q,
      statusValue: status,
    });
  };

  const headerStats = useMemo(() => {
    const total = Number(pagination.total || 0);
    const showing = Array.isArray(rows) ? rows.length : 0;

    let paid = 0;
    let pending = 0;
    let failed = 0;

    rows.forEach((r) => {
      const st = String(r?.status || "PENDING").toUpperCase();
      if (st === "PAID") paid += 1;
      else if (st === "FAILED") failed += 1;
      else pending += 1;
    });

    return { total, showing, paid, pending, failed };
  }, [pagination.total, rows]);

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto rounded-2xl border border-yellow-700/40 bg-gradient-to-b from-black via-yellow-950/20 to-black text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-yellow-700/40 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-500">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-black/35 flex items-center justify-center shadow-lg shadow-yellow-900/20">
                <FaReceipt className="text-white text-xl" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight">
                  Auto Deposit History
                </div>
                <div className="text-xs text-white/85">
                  All OraclePay auto deposits with bonus & turnover details
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-black/20 bg-black/25 px-4 py-2">
                <div className="text-[12px] text-white/80">Showing</div>
                <div className="text-[14px] font-extrabold">
                  {headerStats.showing}
                </div>
                <div className="text-[12px] text-white/60">/</div>
                <div className="text-[12px] text-white/80">Total</div>
                <div className="text-[14px] font-extrabold">
                  {headerStats.total}
                </div>
              </div>

              <button
                onClick={onRefresh}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-black bg-white/90 hover:bg-white transition border border-black/20 disabled:opacity-60"
              >
                <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Small stats */}
        <div className="px-5 md:px-6 py-4 border-b border-yellow-700/25">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
              <div className="text-[12px] text-emerald-200/80 font-bold">
                Paid
              </div>
              <div className="text-xl font-extrabold text-emerald-200">
                {headerStats.paid}
              </div>
            </div>

            <div className="rounded-xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3">
              <div className="text-[12px] text-yellow-200/80 font-bold">
                Pending
              </div>
              <div className="text-xl font-extrabold text-yellow-200">
                {headerStats.pending}
              </div>
            </div>

            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3">
              <div className="text-[12px] text-red-200/80 font-bold">
                Failed
              </div>
              <div className="text-xl font-extrabold text-red-200">
                {headerStats.failed}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-5 md:p-6 border-b border-yellow-700/30">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-3">
            <form onSubmit={onSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-300" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search: username / phone / invoice / transactionId / bonus"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/50 border border-yellow-700/50 text-white placeholder-yellow-100/30 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
              />
            </form>

            <div className="flex items-center gap-2">
              <div className="text-[12px] font-extrabold text-yellow-100/80 inline-flex items-center gap-2">
                <FaFilter className="text-yellow-300" />
                Status
              </div>
              <select
                value={status}
                onChange={(e) => onChangeStatus(e.target.value)}
                className="w-full py-3 px-3 rounded-xl bg-black/50 border border-yellow-700/50 text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
              >
                <option value="ALL">All</option>
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-[12px] font-extrabold text-yellow-100/80">
                Per Page
              </div>
              <select
                value={limit}
                onChange={(e) => onChangeLimit(e.target.value)}
                className="w-full py-3 px-3 rounded-xl bg-black/50 border border-yellow-700/50 text-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <Skeleton />
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-yellow-100/60">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-xl font-extrabold">No records found</div>
            <div className="mt-2 text-sm">
              Try changing filters or search terms
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1180px]">
                <thead>
                  <tr className="bg-black/40 text-yellow-200/90 text-sm">
                    <th className="px-6 py-4 font-semibold">Invoice</th>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Deposit</th>
                    <th className="px-6 py-4 font-semibold">Credited</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((item) => {
                    const isExpanded = expandedId === item._id;

                    const createdAtText = item?.createdAt
                      ? new Date(item.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—";

                    const hasBonus = !!item?.selectedBonus?.bonusId;
                    const bonusType = String(
                      item?.selectedBonus?.bonusType || "",
                    ).toLowerCase();
                    const bonusValue = Number(
                      item?.selectedBonus?.bonusValue || 0,
                    );
                    const bonusAmount = Number(item?.calc?.bonusAmount || 0);
                    const creditedAmount = Number(
                      item?.calc?.creditedAmount || item?.amount || 0,
                    );
                    const turnoverMultiplier = Number(
                      item?.calc?.turnoverMultiplier || 1,
                    );
                    const targetTurnover = Number(
                      item?.calc?.targetTurnover || item?.amount || 0,
                    );

                    const bonusTitle =
                      item?.selectedBonus?.title?.en ||
                      item?.selectedBonus?.title?.bn ||
                      "";

                    return (
                      <React.Fragment key={item._id}>
                        <tr
                          className={`border-b border-yellow-900/20 hover:bg-black/30 transition-colors ${
                            isExpanded ? "bg-black/25" : ""
                          }`}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-white/90 break-all">
                            <div>{item.invoiceNumber || "—"}</div>
                            {hasBonus ? (
                              <div className="mt-1 inline-flex items-center gap-2 text-[11px] text-yellow-200/80 font-bold">
                                {bonusType === "percent" ? (
                                  <FaPercentage />
                                ) : (
                                  <FaGift />
                                )}
                                {bonusTitle || "Bonus"}
                              </div>
                            ) : (
                              <div className="mt-1 text-[11px] text-white/45 font-bold">
                                No bonus
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="inline-flex items-center gap-2">
                                <FaUser className="text-yellow-400/70" />
                                <span className="font-extrabold text-white/90">
                                  {item.userName ||
                                    item.userDbUserId ||
                                    "Unknown"}
                                </span>
                              </div>

                              <div className="inline-flex items-center gap-2 text-[12px] text-yellow-100/70">
                                <FaPhoneAlt className="text-yellow-300/70" />
                                <span className="break-all">
                                  {item.userPhone || "—"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-extrabold text-yellow-300">
                            {money(item.amount)}
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-extrabold text-emerald-300">
                              {money(creditedAmount)}
                            </div>
                            <div className="mt-1 text-[11px] text-white/55 font-bold">
                              x{turnoverMultiplier} | {money(targetTurnover)}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${statusChip(
                                item.status,
                              )}`}
                            >
                              <FaCircle
                                className={`text-[10px] ${statusDot(item.status)}`}
                              />
                              {String(item.status || "PENDING").toUpperCase()}
                            </span>

                            {item.balanceAdded === true ? (
                              <div className="mt-2 text-[11px] text-emerald-200/90 font-bold">
                                Balance Added ✅
                              </div>
                            ) : (
                              <div className="mt-2 text-[11px] text-yellow-100/70 font-bold">
                                Balance Pending…
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm text-white/80">
                            {createdAtText}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-3">
                              {item.footprint ? (
                                <a
                                  href={item.footprint}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-yellow-700/50 bg-black/40 hover:bg-yellow-900/25 text-yellow-200 font-extrabold text-[12px] transition"
                                  title="Open footprint"
                                >
                                  <FaExternalLinkAlt className="text-[11px]" />
                                  Footprint
                                </a>
                              ) : (
                                <span className="text-[12px] text-yellow-100/40">
                                  No link
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedId(isExpanded ? "" : item._id)
                                }
                                className="p-2 rounded-lg border border-yellow-700/50 bg-black/40 hover:bg-yellow-900/25 text-yellow-200 transition"
                                title="Details"
                              >
                                {isExpanded ? (
                                  <FaChevronUp />
                                ) : (
                                  <FaChevronDown />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-0 bg-black/40">
                              <div className="p-5 md:p-6 grid grid-cols-1 xl:grid-cols-4 gap-4">
                                {/* Column 1 */}
                                <div className="rounded-2xl border border-yellow-700/40 bg-black/35 p-4">
                                  <div className="text-[13px] font-extrabold text-yellow-200 mb-2 inline-flex items-center gap-2">
                                    <FaMoneyBillWave className="text-yellow-300" />
                                    Payment
                                  </div>

                                  <FieldRow
                                    k="Invoice"
                                    v={item.invoiceNumber || "—"}
                                  />
                                  <FieldRow
                                    k="Deposit"
                                    v={money(item.amount)}
                                  />
                                  <FieldRow
                                    k="Credited"
                                    v={money(creditedAmount)}
                                  />
                                  <FieldRow k="Bank" v={item.bank || "—"} />
                                  <FieldRow
                                    k="Status"
                                    v={String(
                                      item.status || "PENDING",
                                    ).toUpperCase()}
                                  />
                                  <FieldRow
                                    k="Paid At"
                                    v={
                                      item.paidAt
                                        ? new Date(item.paidAt).toLocaleString()
                                        : "—"
                                    }
                                    noBorder={!item.footprint}
                                  />

                                  {item.footprint ? (
                                    <div className="pt-3">
                                      <a
                                        href={item.footprint}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-[13px] font-extrabold text-yellow-300 hover:underline"
                                      >
                                        <FaExternalLinkAlt className="text-[12px]" />
                                        Open Footprint
                                      </a>
                                    </div>
                                  ) : null}
                                </div>

                                {/* Column 2 */}
                                <div className="rounded-2xl border border-yellow-700/40 bg-black/35 p-4">
                                  <div className="text-[13px] font-extrabold text-yellow-200 mb-2 inline-flex items-center gap-2">
                                    {hasBonus ? (
                                      bonusType === "percent" ? (
                                        <FaPercentage className="text-yellow-300" />
                                      ) : (
                                        <FaGift className="text-yellow-300" />
                                      )
                                    ) : (
                                      <FaGift className="text-yellow-300" />
                                    )}
                                    Bonus & Turnover
                                  </div>

                                  <FieldRow
                                    k="Bonus Title"
                                    v={bonusTitle || "No bonus selected"}
                                  />
                                  <FieldRow
                                    k="Bonus Type"
                                    v={
                                      hasBonus
                                        ? bonusType === "percent"
                                          ? "PERCENT"
                                          : "FIXED"
                                        : "—"
                                    }
                                  />
                                  <FieldRow
                                    k="Bonus Value"
                                    v={
                                      hasBonus
                                        ? bonusType === "percent"
                                          ? `${bonusValue}%`
                                          : money(bonusValue)
                                        : "—"
                                    }
                                  />
                                  <FieldRow
                                    k="Bonus Amount"
                                    v={money(bonusAmount)}
                                  />
                                  <FieldRow
                                    k="Multiplier"
                                    v={`x${turnoverMultiplier}`}
                                  />
                                  <FieldRow
                                    k="Target Turnover"
                                    v={money(targetTurnover)}
                                    noBorder
                                  />

                                  <div className="mt-4 rounded-xl border border-yellow-700/30 bg-yellow-500/5 p-3 text-[12px] text-yellow-100/75 leading-relaxed">
                                    {hasBonus
                                      ? `Deposit ${money(
                                          item.amount,
                                        )} + bonus ${money(
                                          bonusAmount,
                                        )} = credited ${money(
                                          creditedAmount,
                                        )}. Turnover target is ${money(
                                          targetTurnover,
                                        )} at x${turnoverMultiplier}.`
                                      : `No bonus selected. Credited amount is ${money(
                                          creditedAmount,
                                        )} and turnover target is ${money(
                                          targetTurnover,
                                        )} at 1x.`}
                                  </div>
                                </div>

                                {/* Column 3 */}
                                <div className="rounded-2xl border border-yellow-700/40 bg-black/35 p-4">
                                  <div className="text-[13px] font-extrabold text-yellow-200 mb-2">
                                    Transaction
                                  </div>

                                  <FieldRow
                                    k="Transaction ID"
                                    v={item.transactionId || "—"}
                                  />
                                  <FieldRow
                                    k="Session Code"
                                    v={item.sessionCode || "—"}
                                  />
                                  <FieldRow
                                    k="Balance Added"
                                    v={item.balanceAdded ? "YES" : "NO"}
                                  />
                                  <FieldRow
                                    k="Updated At"
                                    v={
                                      item.updatedAt
                                        ? new Date(
                                            item.updatedAt,
                                          ).toLocaleString()
                                        : "—"
                                    }
                                    noBorder
                                  />

                                  <div className="mt-4 rounded-xl border border-yellow-700/30 bg-black/25 p-3">
                                    <div className="text-[12px] font-extrabold text-yellow-100/80 inline-flex items-center gap-2">
                                      <FaChartLine className="text-yellow-300" />
                                      Affiliate Commission
                                    </div>

                                    <div className="mt-3 space-y-2">
                                      <FieldRow
                                        k="Affiliator"
                                        v={
                                          item?.calc?.affiliateDepositCommission
                                            ?.affiliatorUserId || "—"
                                        }
                                      />
                                      <FieldRow
                                        k="Percent"
                                        v={`${
                                          Number(
                                            item?.calc
                                              ?.affiliateDepositCommission
                                              ?.percent || 0,
                                          ) || 0
                                        }%`}
                                      />
                                      <FieldRow
                                        k="Base Amount"
                                        v={money(
                                          item?.calc?.affiliateDepositCommission
                                            ?.baseAmount || 0,
                                        )}
                                      />
                                      <FieldRow
                                        k="Commission"
                                        v={money(
                                          item?.calc?.affiliateDepositCommission
                                            ?.commissionAmount || 0,
                                        )}
                                        noBorder
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Column 4 */}
                                <div className="rounded-2xl border border-yellow-700/40 bg-black/35 p-4">
                                  <div className="text-[13px] font-extrabold text-yellow-200 mb-2">
                                    User
                                  </div>

                                  <FieldRow
                                    k="User Name"
                                    v={
                                      item.userName ||
                                      item.userDbUserId ||
                                      "Unknown"
                                    }
                                  />
                                  <FieldRow
                                    k="DB User ID"
                                    v={item.userDbUserId || "—"}
                                  />
                                  <FieldRow
                                    k="Phone"
                                    v={item.userPhone || "—"}
                                  />
                                  <FieldRow
                                    k="Role"
                                    v={item.userRole || "user"}
                                  />
                                  <FieldRow
                                    k="User Mongo ID"
                                    v={String(
                                      item.userMongoId ||
                                        item.userId ||
                                        item.userIdentity ||
                                        "—",
                                    )}
                                    noBorder
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-5 border-t border-yellow-700/30 flex items-center justify-between flex-wrap gap-4">
                <div className="text-sm text-yellow-100/70">
                  Showing{" "}
                  <span className="font-extrabold text-white">
                    {(page - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-extrabold text-white">
                    {Math.min(page * limit, pagination.total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-extrabold text-white">
                    {pagination.total}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-black/50 border border-yellow-700/50 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-900/30 transition"
                  >
                    Previous
                  </button>

                  <div className="px-4 py-2 rounded-lg border border-yellow-700/40 bg-black/35 text-yellow-100">
                    Page{" "}
                    <span className="font-extrabold text-white">{page}</span> /{" "}
                    <span className="font-extrabold text-white">
                      {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg bg-black/50 border border-yellow-700/50 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-900/30 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AutoDepositHistory;
