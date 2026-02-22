import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaWallet,
  FaClock,
  FaSyncAlt,
} from "react-icons/fa";
import { api } from "../../api/axios";

/* helpers */
const money = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  confirmText,
  confirmVariant = "approve",
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
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[520px] rounded-2xl overflow-hidden border border-yellow-700/40 shadow-2xl">
        <div className="bg-gradient-to-br from-black via-yellow-950/30 to-black p-5">
          <div className="text-xl font-black text-white">{title}</div>
          <div className="mt-1 text-[13px] text-yellow-200/80">
            {description}
          </div>

          <div className="mt-4">
            <label className="text-[12px] font-bold text-yellow-200/80">
              Admin Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl bg-black/60 border border-yellow-700/40 text-white placeholder-yellow-200/30 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400/30"
              placeholder="Write note..."
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/30 transition"
              disabled={loading}
            >
              Cancel
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

const FieldRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-yellow-700/15">
    <div className="text-[12px] font-black text-yellow-200/70">{k}</div>
    <div className="text-[13px] font-bold text-white text-right break-all">
      {v}
    </div>
  </div>
);

const DepositRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState("approve");
  const [note, setNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const canAction = useMemo(() => doc?.status === "pending", [doc?.status]);

  const fetchOne = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/admin/deposit-requests/${id}`);
      setDoc(data?.data || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openConfirm = (type) => {
    setConfirmType(type);
    setNote("");
    setConfirmOpen(true);
  };

  const doAction = async () => {
    if (!doc?._id) return;
    try {
      setActionLoading(true);
      if (confirmType === "approve") {
        await api.post(`/api/admin/deposit-requests/${doc._id}/approve`, {
          adminNote: note,
        });
        toast.success("Approved!");
      } else {
        await api.post(`/api/admin/deposit-requests/${doc._id}/reject`, {
          adminNote: note,
        });
        toast.success("Rejected!");
      }
      setConfirmOpen(false);
      await fetchOne();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Top controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/30 transition w-fit"
        >
          <FaArrowLeft />
          Back
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOne}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/30 transition"
          >
            <FaSyncAlt />
            Refresh
          </button>

          <button
            onClick={() => openConfirm("approve")}
            disabled={!canAction}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-black shadow-lg
              ${
                canAction
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400"
                  : "bg-emerald-500/30 text-black/50 cursor-not-allowed"
              }`}
          >
            <FaCheckCircle />
            Approve
          </button>

          <button
            onClick={() => openConfirm("reject")}
            disabled={!canAction}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-black shadow-lg
              ${
                canAction
                  ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400"
                  : "bg-red-500/30 text-black/50 cursor-not-allowed"
              }`}
          >
            <FaTimesCircle />
            Reject
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-yellow-700/40 bg-gradient-to-br from-black via-yellow-950/20 to-black shadow-2xl overflow-hidden">
        <div className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="text-2xl font-black text-white tracking-tight">
                Deposit Request Details
              </div>
              <div className="mt-1 text-[13px] text-yellow-200/80">
                Request ID: <span className="text-white font-black">{id}</span>
              </div>
            </div>

            <div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-[12px] font-black border ${chipClass(
                  doc?.status || "pending",
                )}`}
              >
                {String(doc?.status || "pending").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mt-5 h-[1px] bg-yellow-700/25" />

          {loading ? (
            <div className="py-12 text-center text-yellow-200/70">
              Loading...
            </div>
          ) : !doc ? (
            <div className="py-12 text-center text-yellow-200/70">
              Not found.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
              {/* Left: User + fields */}
              <div className="rounded-2xl border border-yellow-700/30 bg-black/40 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black shadow-lg shadow-yellow-500/30">
                    <FaUser />
                  </div>
                  <div>
                    <div className="text-[16px] font-black text-white">
                      {doc?.user?.username || "—"}
                    </div>
                    <div className="text-[12px] text-yellow-200/70">
                      {doc?.user?.phone || ""}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-yellow-700/20 bg-black/30 px-4 py-3">
                  <div className="text-[12px] font-black text-yellow-200/80 flex items-center gap-2">
                    <FaClock />
                    Timeline
                  </div>
                  <div className="mt-2 text-[12px] text-yellow-200/70">
                    Created:{" "}
                    <span className="text-white font-bold">
                      {new Date(doc.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {doc?.approvedAt && (
                    <div className="mt-1 text-[12px] text-yellow-200/70">
                      Approved:{" "}
                      <span className="text-white font-bold">
                        {new Date(doc.approvedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {doc?.rejectedAt && (
                    <div className="mt-1 text-[12px] text-yellow-200/70">
                      Rejected:{" "}
                      <span className="text-white font-bold">
                        {new Date(doc.rejectedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-[13px] font-black text-yellow-200/80">
                    Submitted Fields
                  </div>

                  <div className="mt-2 rounded-xl border border-yellow-700/20 bg-black/30 px-4 py-2">
                    {doc?.fields && Object.keys(doc.fields).length ? (
                      Object.keys(doc.fields).map((k) => (
                        <FieldRow
                          key={k}
                          k={k}
                          v={String(doc.fields[k] ?? "")}
                        />
                      ))
                    ) : (
                      <div className="py-3 text-[12px] text-yellow-200/70">
                        No fields submitted.
                      </div>
                    )}
                  </div>

                  {doc?.adminNote ? (
                    <div className="mt-4 rounded-xl border border-yellow-700/20 bg-black/30 px-4 py-3">
                      <div className="text-[12px] font-black text-yellow-200/80">
                        Admin Note
                      </div>
                      <div className="mt-1 text-[13px] text-white/90">
                        {doc.adminNote}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Right: Amount summary */}
              <div className="rounded-2xl border border-yellow-700/30 bg-black/40 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black shadow-lg shadow-yellow-500/30">
                    <FaWallet />
                  </div>
                  <div>
                    <div className="text-[16px] font-black text-white">
                      Payment Summary
                    </div>
                    <div className="text-[12px] text-yellow-200/70">
                      Method:{" "}
                      <span className="text-white font-bold">
                        {String(doc.methodId || "").toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[12px] text-yellow-200/70">
                      Channel:{" "}
                      <span className="text-white font-bold">
                        {doc.channelId || "—"}
                      </span>
                    </div>
                    <div className="text-[12px] text-yellow-200/70">
                      Promo:{" "}
                      <span className="text-white font-bold">
                        {doc.promoId || "none"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-yellow-700/20 bg-black/30 px-4 py-3">
                  <FieldRow k="Deposit Amount" v={money(doc.amount)} />
                  <FieldRow
                    k="Promo Bonus"
                    v={money(doc?.calc?.promoBonus || 0)}
                  />
                  <FieldRow
                    k="Channel Bonus"
                    v={money(doc?.calc?.percentBonus || 0)}
                  />
                  <FieldRow
                    k="Total Bonus"
                    v={money(doc?.calc?.totalBonus || 0)}
                  />
                  <FieldRow
                    k="Turnover Multiplier"
                    v={`x${doc?.calc?.turnoverMultiplier ?? 13}`}
                  />
                  <FieldRow
                    k="Target Turnover"
                    v={money(doc?.calc?.targetTurnover || 0)}
                  />
                  <div className="pt-2">
                    <div className="text-[11px] text-yellow-200/60">
                      On approve: credited amount = deposit + bonus.
                    </div>
                    <div className="mt-2 text-[16px] font-black text-white">
                      Credited Amount: {money(doc?.calc?.creditedAmount || 0)}
                    </div>
                  </div>
                </div>

                {/* quick tips */}
                <div className="mt-4 text-[12px] text-yellow-200/70">
                  {doc.status === "pending"
                    ? "Pending request. You can approve/reject from top buttons."
                    : "This request is already processed."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={
          confirmType === "approve" ? "Approve Deposit?" : "Reject Deposit?"
        }
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

export default DepositRequestDetails;
