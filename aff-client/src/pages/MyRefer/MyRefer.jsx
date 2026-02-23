import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "../../features/auth/authSelectors";
import { api } from "../../api/axios";

import {
  FaSearch,
  FaSyncAlt,
  FaToggleOn,
  FaToggleOff,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
} from "react-icons/fa";

const money = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const StatusChip = ({ active }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${
      active
        ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/30"
        : "bg-red-500/15 text-red-200 border-red-400/30"
    }`}
  >
    {active ? "ACTIVE" : "INACTIVE"}
  </span>
);

const ConfirmModal = ({ open, onClose, onConfirm, title, subtitle }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-[92vw] max-w-[420px] rounded-2xl border border-cyan-700/40 bg-gradient-to-b from-gray-950 via-cyan-950/25 to-gray-950 text-white shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-cyan-800/40">
          <div className="text-[16px] font-extrabold">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-[12px] text-white/70">{subtitle}</div>
          ) : null}
        </div>

        <div className="p-5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-cyan-800/50 bg-black/40 hover:bg-black/55 transition font-extrabold text-[13px]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 transition font-extrabold text-[13px] text-white border border-cyan-500/40"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const MyRefer = () => {
  const token = useSelector(selectToken);
  const me = useSelector(selectUser);

  // ✅ currency symbol from logged in user
  const currencySymbol = useMemo(() => {
    const c = me?.currency || "BDT";
    return c === "USDT" ? "$" : "৳";
  }, [me?.currency]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | active | inactive

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [nextActive, setNextActive] = useState(true);
  const [savingToggle, setSavingToggle] = useState(false);

  const authHeaders = useMemo(() => {
    // তোমার api instance যদি আগেই token attach করে, এটা harmless
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchData = async ({ page = 1, limit = meta.limit } = {}) => {
    try {
      if (!refreshing) setLoading(true);

      const params = { page, limit };
      if (q) params.q = q;
      if (status) params.status = status;

      const { data } = await api.get("/api/affiliate/my-refers", {
        params,
        headers: authHeaders,
      });

      if (!data?.success) throw new Error(data?.message || "Fetch failed");

      setRows(data?.data || []);
      setMeta({
        page: data?.meta?.page || page,
        limit: data?.meta?.limit || limit,
        total: data?.meta?.total || 0,
        totalPages: data?.meta?.totalPages || 1,
      });
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to load referrals",
      );
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
    fetchData({ page: 1 });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData({ page: meta.page });
    toast.info("Refreshed");
  };

  const onChangeStatus = (val) => {
    setStatus(val);
    fetchData({ page: 1 });
  };

  const openToggleModal = (user) => {
    setSelectedUser(user);
    setNextActive(!user.isActive);
    setModalOpen(true);
  };

  const confirmToggle = async () => {
    if (!selectedUser?._id) return;
    try {
      setSavingToggle(true);

      // optimistic update
      setRows((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, isActive: nextActive } : u,
        ),
      );

      const { data } = await api.patch(
        `/api/affiliate/my-refers/${selectedUser._id}/active`,
        { isActive: nextActive },
        { headers: authHeaders },
      );

      if (!data?.success) throw new Error(data?.message || "Update failed");

      toast.success("Status updated");
      setModalOpen(false);
      setSelectedUser(null);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Update failed");
      // rollback by refetch
      fetchData({ page: meta.page });
    } finally {
      setSavingToggle(false);
    }
  };

  const onPage = (p) => {
    if (p < 1 || p > meta.totalPages) return;
    fetchData({ page: p });
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto rounded-2xl border border-cyan-800/45 bg-gradient-to-b from-gray-950 via-cyan-950/20 to-gray-950 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-cyan-800/45 bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-700">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-black/35 flex items-center justify-center shadow-lg shadow-cyan-900/20">
                <FaUsers className="text-white text-xl" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight">
                  My Referrals
                </div>
                <div className="text-xs text-white/85">
                  Users registered using your referral code
                </div>
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

        {/* Toolbar */}
        <div className="p-5 md:p-6 border-b border-cyan-800/35">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-3">
            {/* Search */}
            <form onSubmit={onSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search by username..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/45 border border-cyan-800/55 text-white placeholder-white/25 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              />
            </form>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <div className="text-[12px] font-extrabold text-white/75">
                Status
              </div>
              <select
                value={status}
                onChange={(e) => onChangeStatus(e.target.value)}
                className="w-full py-3 px-3 rounded-xl bg-black/45 border border-cyan-800/55 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Count */}
            <div className="flex items-center justify-between lg:justify-end gap-3 rounded-xl bg-black/35 border border-cyan-800/45 px-4 py-3">
              <div className="text-[12px] text-white/65">Total</div>
              <div className="text-[14px] font-extrabold text-white">
                {meta.total}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-5 md:p-6">
          {loading ? (
            <div className="py-12 text-center text-white/70">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-white/70">
              <div className="text-5xl mb-3">📭</div>
              No referred users found
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-cyan-800/35">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/50 text-white/85 text-sm">
                    <th className="px-6 py-4 font-semibold">Username</th>
                    <th className="px-6 py-4 font-semibold">Phone</th>
                    <th className="px-6 py-4 font-semibold">Balance</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <tr
                      key={u._id}
                      className="border-t border-cyan-900/35 hover:bg-black/35 transition"
                    >
                      <td className="px-6 py-4 font-extrabold text-white/90">
                        {u.username || "—"}
                      </td>
                      <td className="px-6 py-4 text-white/80">
                        {u.phone || "—"}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-cyan-200">
                        {currencySymbol}{" "}
                        {money(u.balance).replace("৳ ", "").replace("$ ", "")}
                      </td>
                      <td className="px-6 py-4">
                        <StatusChip active={!!u.isActive} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openToggleModal(u)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-[13px] border transition ${
                            u.isActive
                              ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/20"
                              : "bg-red-500/15 text-red-200 border-red-400/30 hover:bg-red-500/20"
                          }`}
                        >
                          {u.isActive ? <FaToggleOn /> : <FaToggleOff />}
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 ? (
            <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
              <div className="text-[12px] text-white/70">
                Page{" "}
                <span className="font-extrabold text-white">{meta.page}</span>{" "}
                of{" "}
                <span className="font-extrabold text-white">
                  {meta.totalPages}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPage(meta.page - 1)}
                  disabled={meta.page <= 1 || loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/45 border border-cyan-800/55 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-900/25 transition"
                >
                  <FaChevronLeft />
                  Prev
                </button>

                <button
                  onClick={() => onPage(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages || loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/45 border border-cyan-800/55 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-900/25 transition"
                >
                  Next
                  <FaChevronRight />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={modalOpen}
        onClose={() => (!savingToggle ? setModalOpen(false) : null)}
        onConfirm={confirmToggle}
        title={nextActive ? "Activate user?" : "Deactivate user?"}
        subtitle={
          selectedUser
            ? `User: ${selectedUser.username} (${selectedUser.phone || "—"})`
            : ""
        }
      />
    </div>
  );
};

export default MyRefer;
