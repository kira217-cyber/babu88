// src/pages/admin/Withdraw/WithdrawRequestDetails.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { api } from "../../api/axios";

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

const FieldRow = ({ k, v }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-yellow-700/15">
    <div className="text-[12px] font-bold text-yellow-200/70">{k}</div>
    <div className="text-[13px] font-extrabold text-white text-right break-all">
      {v}
    </div>
  </div>
);

const ConfirmInline = ({
  open,
  title,
  confirmText,
  confirmClass,
  loading,
  note,
  setNote,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="mt-4 rounded-2xl border border-yellow-700/30 bg-black/40 p-4">
      <div className="text-[14px] font-extrabold text-yellow-100">{title}</div>

      <div className="mt-3 text-[12px] font-bold text-yellow-200/80">
        Admin Note (optional)
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write a note for user..."
        className="mt-2 w-full min-h-[90px] rounded-xl bg-black/60 border border-yellow-700/40 text-white placeholder-yellow-200/40 p-3 outline-none focus:ring-2 focus:ring-yellow-400/30"
      />

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/30 transition disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 rounded-xl font-extrabold transition disabled:opacity-60 ${confirmClass}`}
        >
          {loading ? "Processing..." : confirmText}
        </button>
      </div>
    </div>
  );
};

const WithdrawRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);

  const fetchOne = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/withdraw-requests/${id}`);
      setRow(data?.data || data || null);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load request details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const statusText = String(row?.status || "pending");
  const createdAt = row?.createdAt ? new Date(row.createdAt).toLocaleString() : "—";

  const username = row?.user?.username || row?.username || "—";
  const phone = row?.user?.phone || row?.phone || "";

  const fields = useMemo(() => row?.fields || {}, [row]);

  const approveNow = async () => {
    if (!row?._id) return;
    try {
      setActing(true);
      await api.patch(`/api/withdraw-requests/${row._id}/approve`, {
        adminNote: note,
      });
      toast.success("Withdraw approved");
      setApproveOpen(false);
      setRejectOpen(false);
      setNote("");
      fetchOne();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Approve failed");
    } finally {
      setActing(false);
    }
  };

  const rejectNow = async () => {
    if (!row?._id) return;
    try {
      setActing(true);
      await api.patch(`/api/withdraw-requests/${row._id}/reject`, {
        adminNote: note,
      });
      toast.success("Withdraw rejected");
      setApproveOpen(false);
      setRejectOpen(false);
      setNote("");
      fetchOne();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Reject failed");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-yellow-700/30 bg-gradient-to-br from-black via-yellow-950/20 to-black shadow-2xl overflow-hidden">
        {/* Top */}
        <div className="p-5 sm:p-6 border-b border-yellow-700/30 flex items-center justify-between gap-3">
          <div>
            <div className="text-[18px] font-extrabold text-white">
              Withdraw Request Details
            </div>
            <div className="mt-1 text-[12px] text-yellow-200/70">
              Request ID: <span className="font-bold text-yellow-100">{id}</span>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-700/40 bg-black/40 text-yellow-100 hover:bg-yellow-900/30 transition text-[13px] font-extrabold"
          >
            <FaArrowLeft />
            Back
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-[13px] text-yellow-200/70">
            Loading...
          </div>
        ) : !row ? (
          <div className="p-10 text-center text-[13px] text-yellow-200/70">
            No data found.
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            {/* Summary row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-yellow-700/30 bg-black/40 p-4">
                <div className="text-[12px] text-yellow-200/70 font-bold">
                  User
                </div>
                <div className="mt-1 text-[15px] font-extrabold text-white">
                  {username}
                </div>
                <div className="text-[12px] text-yellow-200/60">
                  {phone ? `+${phone}` : "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-700/30 bg-black/40 p-4">
                <div className="text-[12px] text-yellow-200/70 font-bold">
                  Amount
                </div>
                <div className="mt-1 text-[15px] font-extrabold text-white">
                  {money(row?.amount || 0)}
                </div>
                <div className="text-[12px] text-yellow-200/60">
                  Method: {String(row?.methodId || "—").toUpperCase()}
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-700/30 bg-black/40 p-4">
                <div className="text-[12px] text-yellow-200/70 font-bold">
                  Status
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border ${chipClass(
                      statusText,
                    )}`}
                  >
                    {statusText.toUpperCase()}
                  </span>
                </div>
                <div className="mt-2 text-[12px] text-yellow-200/60">
                  {createdAt}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-yellow-700/30 bg-black/40 p-4">
                <div className="text-[14px] font-extrabold text-yellow-100">
                  Request Info
                </div>

                <div className="mt-3">
                  <FieldRow k="Method ID" v={String(row?.methodId || "—")} />
                  <FieldRow k="Channel ID" v={String(row?.channelId || "—")} />
                  <FieldRow k="Amount" v={money(row?.amount || 0)} />
                  <FieldRow k="Status" v={statusText} />
                  <FieldRow k="Created At" v={createdAt} />
                </div>

                {row?.adminNote ? (
                  <div className="mt-4 rounded-2xl border border-yellow-700/25 bg-black/30 p-3">
                    <div className="text-[12px] font-extrabold text-yellow-200/80">
                      Admin Note
                    </div>
                    <div className="mt-1 text-[13px] text-white">
                      {row.adminNote}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-yellow-700/30 bg-black/40 p-4">
                <div className="text-[14px] font-extrabold text-yellow-100">
                  Submitted Fields
                </div>

                <div className="mt-3 rounded-2xl border border-yellow-700/20 bg-black/30 p-3">
                  {fields && Object.keys(fields).length ? (
                    Object.keys(fields).map((k) => (
                      <FieldRow key={k} k={k} v={String(fields[k] ?? "")} />
                    ))
                  ) : (
                    <div className="py-3 text-[13px] text-yellow-200/70">
                      No submitted fields.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
              <button
                onClick={() => {
                  setRejectOpen(false);
                  setApproveOpen((p) => !p);
                  setNote("");
                }}
                disabled={statusText !== "pending"}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-extrabold transition
                  ${
                    statusText === "pending"
                      ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25"
                      : "opacity-50 cursor-not-allowed bg-emerald-500/10 text-emerald-200/70 border border-emerald-400/20"
                  }`}
              >
                <FaCheckCircle />
                Approve
              </button>

              <button
                onClick={() => {
                  setApproveOpen(false);
                  setRejectOpen((p) => !p);
                  setNote("");
                }}
                disabled={statusText !== "pending"}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-extrabold transition
                  ${
                    statusText === "pending"
                      ? "bg-red-500/20 text-red-200 border border-red-400/30 hover:bg-red-500/25"
                      : "opacity-50 cursor-not-allowed bg-red-500/10 text-red-200/70 border border-red-400/20"
                  }`}
              >
                <FaTimesCircle />
                Reject
              </button>
            </div>

            <ConfirmInline
              open={approveOpen}
              title={`Approve this request? Amount: ${money(row?.amount || 0)}`}
              confirmText="Confirm Approve"
              confirmClass="bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/35"
              loading={acting}
              note={note}
              setNote={setNote}
              onCancel={() => {
                if (acting) return;
                setApproveOpen(false);
                setNote("");
              }}
              onConfirm={approveNow}
            />

            <ConfirmInline
              open={rejectOpen}
              title="Reject this request? (Will refund balance as per server rule)"
              confirmText="Confirm Reject"
              confirmClass="bg-red-500/30 border border-red-400/40 text-red-100 hover:bg-red-500/35"
              loading={acting}
              note={note}
              setNote={setNote}
              onCancel={() => {
                if (acting) return;
                setRejectOpen(false);
                setNote("");
              }}
              onConfirm={rejectNow}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawRequestDetails;