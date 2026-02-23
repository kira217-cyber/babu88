import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  FaSearch,
  FaSyncAlt,
  FaBolt,
  FaUser,
  FaPhoneAlt,
  FaChevronDown,
  FaChevronUp,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { selectAuth } from "../../features/auth/authSelectors";
import { api } from "../../api/axios";

const n = (v) => {
  const num = Number(v || 0);
  return Number.isFinite(num) ? num : 0;
};

const money = (v, currency = "BDT") => {
  const symbol = currency === "USDT" ? "$" : "৳";
  const num = n(v);
  return `${symbol} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chipClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "positive")
    return "bg-emerald-600/20 text-emerald-300 border-emerald-500/30";
  if (s === "negative") return "bg-red-600/20 text-red-300 border-red-500/30";
  return "bg-amber-500/20 text-amber-300 border-amber-500/30";
};

const FieldRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-yellow-700/25 last:border-b-0">
    <div className="text-[13px] font-semibold text-yellow-100/75">{k}</div>
    <div className="text-[13px] font-extrabold text-white/95 text-right break-all">
      {v}
    </div>
  </div>
);

const Skeleton = () => (
  <div className="p-5 sm:p-6 space-y-4">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="h-16 w-full rounded-xl bg-white/5 animate-pulse"
      />
    ))}
  </div>
);

const ConfirmModal = ({
  open,
  title,
  desc,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-yellow-700/40 bg-gradient-to-b from-black via-yellow-950/30 to-black text-white shadow-2xl shadow-yellow-900/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-yellow-700/40 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <FaExclamationTriangle className="text-amber-300 text-xl" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-extrabold tracking-tight">{title}</div>
            {desc && (
              <div className="text-sm text-yellow-100/70 mt-1">{desc}</div>
            )}
          </div>
        </div>

        <div className="px-6 py-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm disabled:opacity-50 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 border border-amber-400/30 text-white font-semibold text-sm disabled:opacity-50 inline-flex items-center gap-2 shadow-md transition"
          >
            {loading ? (
              <FaSyncAlt className="animate-spin" />
            ) : (
              <FaCheckCircle />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const AffiliateBrige = () => {
  const auth = useSelector(selectAuth);
  const headers = useMemo(
    () => (auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    [auth?.token],
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [singleModal, setSingleModal] = useState({ open: false, user: null });
  const [allModal, setAllModal] = useState(false);
  const [bridging, setBridging] = useState(false);

  const page = pagination.page;
  const limit = pagination.limit;
  const totalPages = pagination.totalPages;

  const fetchData = async (
    { page: p = page, limit: l = limit, query = q } = {},
    isRefresh = false,
  ) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = { page: p, limit: l };
      if (query) params.q = query;

      const { data } = await api.get("/api/admin/affiliate-bridge/users", {
        params,
        headers,
      });

      if (!data?.success) throw new Error(data?.message || "Fetch failed");

      setRows(Array.isArray(data?.data) ? data.data : []);
      setPagination({
        page: data?.pagination?.page || p,
        limit: data?.pagination?.limit || l,
        total: data?.pagination?.total || 0,
        totalPages: data?.pagination?.totalPages || 1,
      });

      setExpandedId("");
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Server error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const query = qInput.trim();
    setQ(query);
    fetchData({ page: 1, query }, true);
  };

  const onRefresh = async () => {
    await fetchData({ page }, true);
    toast.info("Refreshed");
  };

  const onPageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchData({ page: newPage }, true);
  };

  const openSingleBridge = (user) => setSingleModal({ open: true, user });
  const closeSingleBridge = () => setSingleModal({ open: false, user: null });

  const computePreview = (u) => {
    const gross =
      n(u?.gameLossCommissionBalance) +
      n(u?.depositCommissionBalance) +
      n(u?.referCommissionBalance);
    const net = gross - n(u?.gameWinCommissionBalance);
    return { gross, net };
  };

  const doBridgeSingle = async () => {
    const user = singleModal.user;
    if (!user?._id) return;

    try {
      setBridging(true);
      const { data } = await api.post(
        `/api/admin/affiliate-bridge/bridge/${user._id}`,
        {},
        { headers },
      );

      if (!data?.success) throw new Error(data?.message || "Bridge failed");

      toast.success("Bridge completed");
      closeSingleBridge();
      await fetchData({ page }, true);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Server error");
    } finally {
      setBridging(false);
    }
  };

  const doBridgeAll = async () => {
    try {
      setBridging(true);
      const body = q ? { q } : {};
      const { data } = await api.post(
        "/api/admin/affiliate-bridge/bridge-all",
        body,
        { headers },
      );

      if (!data?.success) throw new Error(data?.message || "Bridge all failed");

      toast.success(
        `Bridged ${data?.data?.bridgedUsers ?? 0} users successfully`,
      );
      setAllModal(false);
      await fetchData({ page: 1 }, true);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Server error");
    } finally {
      setBridging(false);
    }
  };

  const headerStats = useMemo(() => {
    const total = n(pagination.total);
    const showing = rows.length;

    let pageGross = 0;
    let pageNet = 0;
    rows.forEach((u) => {
      const { gross, net } = computePreview(u);
      pageGross += gross;
      pageNet += net;
    });

    return { total, showing, pageGross, pageNet };
  }, [pagination.total, rows]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black p-4 sm:p-6 lg:p-8 text-white">
      <div className="mx-auto max-w-screen-2xl rounded-2xl border border-yellow-700/40 bg-gradient-to-b from-black via-yellow-950/30 to-black shadow-2xl shadow-yellow-900/40 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-5 sm:px-6 sm:py-6 border-b border-yellow-700/40 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 border border-amber-500/30 shadow-lg">
                <FaBolt className="text-amber-300 text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Affiliate Bridge
                </h1>
                <p className="text-sm text-yellow-100/80 mt-0.5">
                  Move commissions →{" "}
                  <span className="font-semibold text-amber-200">
                    commissionBalance
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden md:flex items-center gap-3 rounded-xl bg-black/40 border border-yellow-700/40 px-4 py-2.5 text-sm">
                <span className="text-yellow-100/80">Showing</span>
                <span className="font-bold text-white">
                  {headerStats.showing}
                </span>
                <span className="text-yellow-100/60">/</span>
                <span className="text-yellow-100/80">Total</span>
                <span className="font-bold text-white">
                  {headerStats.total}
                </span>
              </div>

              <button
                onClick={onRefresh}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-black bg-white/95 hover:bg-white border border-amber-300/60 disabled:opacity-60 transition shadow-sm"
              >
                <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                onClick={() => setAllModal(true)}
                disabled={loading || refreshing || bridging}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-black bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 border border-amber-400/40 shadow-lg disabled:opacity-60 transition"
              >
                <FaBolt className="text-lg" />
                Bridge All
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-5 sm:p-6 border-b border-yellow-700/30 bg-black/40">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {/* Search */}
            <form onSubmit={onSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-lg" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search by username..."
                className="w-full pl-12 pr-5 py-3 rounded-xl bg-black/60 border border-yellow-700/50 text-white placeholder-yellow-400/50 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition"
              />
            </form>

            {/* Per Page */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-yellow-100/90 whitespace-nowrap">
                Per Page
              </label>
              <select
                value={limit}
                onChange={(e) =>
                  fetchData({ page: 1, limit: Number(e.target.value) }, true)
                }
                className="w-full max-w-[140px] py-3 px-4 rounded-xl bg-black/60 border border-yellow-700/50 text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Page Preview */}
            <div className="rounded-xl border border-yellow-700/40 bg-gradient-to-br from-black/70 to-yellow-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm text-yellow-100/80">
                  Current Page Preview
                </div>
                <div className="text-xs text-amber-200/80 mt-0.5">
                  (gross / net)
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {money(headerStats.pageGross)}{" "}
                  <span className="text-yellow-300/60">/</span>{" "}
                  {money(headerStats.pageNet)}
                </div>
                <div className="text-xs text-yellow-100/70 mt-1">
                  gross = loss + deposit + refer • net = gross − win
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Skeleton />
        ) : rows.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="text-6xl mb-6 opacity-70">📭</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No affiliate users found
            </h3>
            <p className="text-yellow-100/70 max-w-md mx-auto">
              Try adjusting search or refresh the list.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-700/30">
                <thead className="bg-black/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200">
                      Affiliate
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200">
                      Commission Bal
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200">
                      Gross
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200">
                      Win Deduct
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200">
                      Net
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-amber-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-700/20">
                  {rows.map((u) => {
                    const id = String(u?._id || "");
                    const isExpanded = expandedId === id;
                    const currency = u?.currency || "BDT";
                    const { gross, net } = computePreview(u);
                    const netType =
                      net > 0 ? "positive" : net < 0 ? "negative" : "zero";

                    return (
                      <React.Fragment key={id}>
                        <tr
                          className={`hover:bg-yellow-950/20 transition-colors ${isExpanded ? "bg-yellow-950/10" : ""}`}
                        >
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/25">
                                <FaUser className="text-amber-300" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-white truncate">
                                  {u?.username || "—"}
                                </div>
                                <div className="text-sm text-yellow-100/70 flex items-center gap-2 mt-0.5">
                                  <FaPhoneAlt className="text-xs" />
                                  <span className="truncate">
                                    {u?.phone || "—"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-bold text-white">
                            {money(u?.commissionBalance ?? 0, currency)}
                          </td>
                          <td className="px-6 py-5 font-bold text-amber-300">
                            {money(gross, currency)}
                          </td>
                          <td className="px-6 py-5 font-bold text-amber-400">
                            {money(u?.gameWinCommissionBalance ?? 0, currency)}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold border ${chipClass(netType)}`}
                            >
                              {money(net, currency)}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => openSingleBridge(u)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black text-sm font-semibold border border-amber-400/30 shadow-md transition disabled:opacity-60"
                              >
                                <FaBolt />
                                Bridge
                              </button>
                              <button
                                onClick={() =>
                                  setExpandedId(isExpanded ? "" : id)
                                }
                                className="p-2 text-amber-300 hover:text-amber-100 transition"
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
                            <td colSpan={6} className="p-0 bg-black/40">
                              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="rounded-xl border border-yellow-700/40 bg-gradient-to-b from-black/70 to-yellow-950/10 p-5">
                                  <h3 className="text-base font-bold text-amber-200 mb-4">
                                    Commission Breakdown
                                  </h3>
                                  <FieldRow
                                    k="Game Loss"
                                    v={money(
                                      u?.gameLossCommissionBalance ?? 0,
                                      currency,
                                    )}
                                  />
                                  <FieldRow
                                    k="Deposit"
                                    v={money(
                                      u?.depositCommissionBalance ?? 0,
                                      currency,
                                    )}
                                  />
                                  <FieldRow
                                    k="Referral"
                                    v={money(
                                      u?.referCommissionBalance ?? 0,
                                      currency,
                                    )}
                                  />
                                  <FieldRow
                                    k="Game Win (deduct)"
                                    v={money(
                                      u?.gameWinCommissionBalance ?? 0,
                                      currency,
                                    )}
                                  />
                                </div>

                                <div className="rounded-xl border border-yellow-700/40 bg-gradient-to-b from-black/70 to-yellow-950/10 p-5">
                                  <h3 className="text-base font-bold text-amber-200 mb-4">
                                    Bridge Preview
                                  </h3>
                                  <FieldRow
                                    k="Gross"
                                    v={money(gross, currency)}
                                  />
                                  <FieldRow k="Net" v={money(net, currency)} />
                                  <FieldRow
                                    k="Current commissionBalance"
                                    v={money(
                                      u?.commissionBalance ?? 0,
                                      currency,
                                    )}
                                  />
                                  <FieldRow
                                    k="Expected after bridge"
                                    v={money(
                                      n(u?.commissionBalance) + net,
                                      currency,
                                    )}
                                  />
                                  <p className="mt-5 text-sm text-yellow-100/70">
                                    All four source balances will be{" "}
                                    <strong className="text-white">
                                      reset to 0
                                    </strong>{" "}
                                    after bridging.
                                  </p>
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
              <div className="px-6 py-5 border-t border-yellow-700/30 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/40">
                <div className="text-sm text-yellow-100/80 order-2 sm:order-1">
                  Showing{" "}
                  <strong className="text-white">
                    {(page - 1) * limit + 1}
                  </strong>
                  –
                  <strong className="text-white">
                    {Math.min(page * limit, pagination.total)}
                  </strong>{" "}
                  of <strong className="text-white">{pagination.total}</strong>
                </div>

                <div className="flex items-center gap-3 order-1 sm:order-2">
                  <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1 || refreshing}
                    className="px-5 py-2.5 rounded-xl bg-black/60 border border-yellow-700/50 text-white disabled:opacity-40 hover:bg-yellow-950/40 transition"
                  >
                    Previous
                  </button>
                  <span className="px-5 py-2.5 font-semibold text-white">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages || refreshing}
                    className="px-5 py-2.5 rounded-xl bg-black/60 border border-yellow-700/50 text-white disabled:opacity-40 hover:bg-yellow-950/40 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        open={singleModal.open}
        title={`Bridge: ${singleModal.user?.username || "User"}`}
        desc={
          singleModal.user
            ? `Gross: ${money(computePreview(singleModal.user).gross)}, Net: ${money(computePreview(singleModal.user).net)}. Source balances will reset to 0.`
            : ""
        }
        confirmText="Bridge Now"
        loading={bridging}
        onClose={bridging ? undefined : closeSingleBridge}
        onConfirm={doBridgeSingle}
      />

      <ConfirmModal
        open={allModal}
        title="Bridge ALL Affiliates?"
        desc={
          q
            ? `This will process all affiliates matching: "${q}"`
            : "This action will bridge commissions for ALL affiliate users."
        }
        confirmText="Confirm Bridge All"
        loading={bridging}
        onClose={bridging ? undefined : () => setAllModal(false)}
        onConfirm={doBridgeAll}
      />
    </div>
  );
};

export default AffiliateBrige;
