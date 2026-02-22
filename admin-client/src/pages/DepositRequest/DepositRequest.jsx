import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaSyncAlt,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { api } from "../../api/axios";

/* ---------------- helpers ---------------- */
const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const chipClass = (status) => {
  if (status === "approved")
    return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  if (status === "rejected")
    return "bg-red-500/15 text-red-200 border-red-400/30";
  return "bg-yellow-500/15 text-yellow-200 border-yellow-400/30";
};

const ConfirmModal = ({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "approve", // approve | reject
  note,
  setNote,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  const btnClass =
    confirmVariant === "reject"
      ? "from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400"
      : "from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] rounded-2xl overflow-hidden border border-yellow-700/40 shadow-2xl">
        <div className="bg-gradient-to-br from-black via-yellow-950/30 to-black p-5">
          <div className="text-xl font-black text-white">{title}</div>
          <div className="mt-1 text-[13px] text-yellow-200/80">{description}</div>

          <div className="mt-4">
            <label className="text-[12px] font-bold text-yellow-200/80">
              Admin Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl bg-black/60 border border-yellow-700/40 text-white placeholder-yellow-200/30 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400/30"
              placeholder="Write note for user / internal..."
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/30 transition"
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-xl font-black text-black bg-gradient-to-r ${btnClass} shadow-lg`}
            >
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- main ---------------- */
const DepositRequest = () => {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });

  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("pending"); // pending | approved | rejected | all
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");

  // confirm modals
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("approve"); // approve|reject
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const pageCount = useMemo(() => {
    const total = Number(meta.total || 0);
    const limit = Number(meta.limit || 10);
    return Math.max(1, Math.ceil(total / limit));
  }, [meta.total, meta.limit]);

  const fetchData = async (page = meta.page) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: meta.limit,
      };

      if (status !== "all") params.status = status;
      if (q) params.q = q;

      const { data } = await api.get("/api/admin/deposit-requests", { params });
      setList(data?.data || []);
      setMeta((m) => ({
        ...m,
        page: data?.meta?.page || page,
        limit: data?.meta?.limit || m.limit,
        total: data?.meta?.total || 0,
      }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load deposit requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q]);

  const openConfirm = (type, row) => {
    setSelected(row);
    setConfirmType(type);
    setNote("");
    setConfirmOpen(true);
  };

  const doAction = async () => {
    if (!selected?._id) return;
    try {
      setActionLoading(true);
      if (confirmType === "approve") {
        await api.post(`/api/admin/deposit-requests/${selected._id}/approve`, {
          adminNote: note,
        });
        toast.success("Approved!");
      } else {
        await api.post(`/api/admin/deposit-requests/${selected._id}/reject`, {
          adminNote: note,
        });
        toast.success("Rejected!");
      }
      setConfirmOpen(false);
      setSelected(null);
      await fetchData(meta.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    setQ(qInput.trim());
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="rounded-2xl border border-yellow-700/40 bg-gradient-to-br from-black via-yellow-950/20 to-black shadow-2xl overflow-hidden">
        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-2xl font-black text-white tracking-tight">
              Deposit Requests
            </div>
            <div className="mt-1 text-[13px] text-yellow-200/80">
              Review pending deposits, approve or reject with notes.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(meta.page)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/30 transition"
            >
              <FaSyncAlt />
              Refresh
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 md:px-6 pb-5">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_140px] gap-3">
            {/* Search */}
            <form onSubmit={onSearch} className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400" />
              <input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search by username or phone..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/60 border border-yellow-700/40 text-white placeholder-yellow-200/30 outline-none focus:ring-2 focus:ring-yellow-400/30"
              />
            </form>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <div className="text-[12px] font-black text-yellow-200/80">
                Status
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full py-3 px-3 rounded-xl bg-black/60 border border-yellow-700/40 text-white outline-none focus:ring-2 focus:ring-yellow-400/30"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>

            {/* Quick meta */}
            <div className="flex items-center justify-between lg:justify-end gap-3 rounded-xl bg-black/40 border border-yellow-700/30 px-4 py-3">
              <div className="text-[12px] text-yellow-200/70">Total</div>
              <div className="text-[14px] font-black text-white">
                {meta.total || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-2 md:px-4 pb-4">
          <div className="rounded-2xl border border-yellow-700/30 bg-black/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full">
                <thead className="bg-gradient-to-r from-yellow-600/20 via-amber-500/10 to-yellow-600/20">
                  <tr className="text-left text-[12px] uppercase tracking-wider text-yellow-200/80">
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Method</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Bonus</th>
                    <th className="px-5 py-4">Turnover</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-yellow-200/70">
                        Loading...
                      </td>
                    </tr>
                  ) : list.length ? (
                    list.map((r) => {
                      const username = r?.user?.username || "—";
                      const phone = r?.user?.phone || "";
                      const method = r?.methodId || "—";
                      const amt = Number(r?.amount || 0);
                      const bonus = Number(r?.calc?.totalBonus || 0);
                      const turnover = Number(r?.calc?.targetTurnover || 0);

                      return (
                        <tr
                          key={r._id}
                          className="border-t border-yellow-700/20 hover:bg-yellow-900/10 transition"
                        >
                          <td className="px-5 py-4">
                            <div className="text-[14px] font-black text-white">
                              {username}
                            </div>
                            <div className="text-[12px] text-yellow-200/60">
                              {phone}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[13px] font-bold text-yellow-100">
                              {method.toUpperCase()}
                            </div>
                            <div className="text-[12px] text-yellow-200/60">
                              Channel: {r?.channelId || "—"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[14px] font-black text-white">
                              {money(amt)}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[14px] font-black text-white">
                              {money(bonus)}
                            </div>
                            <div className="text-[12px] text-yellow-200/60">
                              Promo: {money(r?.calc?.promoBonus || 0)} | Channel:{" "}
                              {money(r?.calc?.percentBonus || 0)}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[14px] font-black text-white">
                              {money(turnover)}
                            </div>
                            <div className="text-[12px] text-yellow-200/60">
                              x{r?.calc?.turnoverMultiplier ?? 13}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-black border ${chipClass(
                                r?.status,
                              )}`}
                            >
                              {String(r?.status || "pending").toUpperCase()}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-[13px] text-yellow-100/90">
                              {new Date(r?.createdAt).toLocaleString()}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/deposit-request/${r._id}`)
                                }
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/30 transition"
                              >
                                <FaEye />
                                View
                              </button>

                              <button
                                onClick={() => openConfirm("approve", r)}
                                disabled={r?.status !== "pending"}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-black text-black shadow-lg
                                  ${
                                    r?.status === "pending"
                                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400"
                                      : "bg-emerald-500/30 text-black/50 cursor-not-allowed"
                                  }`}
                              >
                                <FaCheckCircle />
                                Approve
                              </button>

                              <button
                                onClick={() => openConfirm("reject", r)}
                                disabled={r?.status !== "pending"}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-black text-black shadow-lg
                                  ${
                                    r?.status === "pending"
                                      ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400"
                                      : "bg-red-500/30 text-black/50 cursor-not-allowed"
                                  }`}
                              >
                                <FaTimesCircle />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-5 py-10 text-center text-yellow-200/70">
                        No deposit requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-yellow-700/20 bg-black/30">
              <div className="text-[12px] text-yellow-200/70">
                Page <span className="text-white font-black">{meta.page}</span>{" "}
                of <span className="text-white font-black">{pageCount}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData(Math.max(1, meta.page - 1))}
                  disabled={meta.page <= 1 || loading}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-yellow-700/40 text-yellow-100 transition
                    ${meta.page <= 1 || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-900/30"}`}
                >
                  <FaChevronLeft />
                  Prev
                </button>
                <button
                  onClick={() => fetchData(Math.min(pageCount, meta.page + 1))}
                  disabled={meta.page >= pageCount || loading}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-yellow-700/40 text-yellow-100 transition
                    ${meta.page >= pageCount || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-900/30"}`}
                >
                  Next
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        title={confirmType === "approve" ? "Approve Deposit?" : "Reject Deposit?"}
        description={
          confirmType === "approve"
            ? "This will add amount + bonus to user balance and create turnover."
            : "This will reject the request. No balance will be added."
        }
        confirmText={confirmType === "approve" ? "Yes, Approve" : "Yes, Reject"}
        confirmVariant={confirmType}
        note={note}
        setNote={setNote}
        loading={actionLoading}
        onClose={() => {
          if (actionLoading) return;
          setConfirmOpen(false);
        }}
        onConfirm={doAction}
      />
    </div>
  );
};

export default DepositRequest;