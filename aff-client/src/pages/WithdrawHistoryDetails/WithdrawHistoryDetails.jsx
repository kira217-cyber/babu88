import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { FaArrowLeft } from "react-icons/fa";

import { api } from "../../api/axios";
import {
  selectAuth,
  selectToken,
  selectUser,
} from "../../features/auth/authSelectors";

const symbolByCurrency = (c) =>
  String(c || "BDT").toUpperCase() === "USDT" ? "$" : "৳";

const money = (n, sym = "৳") => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return `${sym} 0.00`;
  return `${sym} ${num.toLocaleString("en-US", {
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
  <div className="flex items-start justify-between gap-4 py-2 border-b border-cyan-800/30">
    <div className="text-[12px] font-bold text-cyan-200/70">{k}</div>
    <div className="text-[13px] font-extrabold text-white text-right break-all">
      {v}
    </div>
  </div>
);

const WithdrawHistoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const auth = useSelector(selectAuth);
  const token = useSelector(selectToken) || auth?.token;
  const user = useSelector(selectUser);

  const sym = useMemo(() => symbolByCurrency(user?.currency || "BDT"), [user]);

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOne = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await api.get(
        `/api/affiliate-withdraw-requests/my/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setRow(data?.data || data || null);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Failed to load withdraw details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const statusText = String(row?.status || "pending");
  const createdAt = row?.createdAt
    ? new Date(row.createdAt).toLocaleString()
    : "—";

  const fields = useMemo(() => row?.fields || {}, [row]);

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-cyan-800/40 bg-gradient-to-br from-gray-950 via-cyan-950/20 to-gray-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-cyan-800/40 flex items-center justify-between gap-3">
          <div>
            <div className="text-[18px] font-extrabold text-white">
              Withdraw History Details
            </div>
            <div className="mt-1 text-[12px] text-cyan-200/70">
              Request ID: <span className="font-bold text-cyan-100">{id}</span>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-700/50 bg-gray-900/40 text-cyan-100 hover:bg-cyan-900/30 transition text-[13px] font-extrabold"
          >
            <FaArrowLeft />
            Back
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-[13px] text-cyan-200/70">
            Loading...
          </div>
        ) : !row ? (
          <div className="p-10 text-center text-[13px] text-cyan-200/70">
            No data found.
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            {/* Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-cyan-800/40 bg-gray-900/40 p-4">
                <div className="text-[12px] text-cyan-200/70 font-bold">
                  Amount
                </div>
                <div className="mt-1 text-[16px] font-extrabold text-white">
                  {money(row?.amount || 0, sym)}
                </div>
                <div className="text-[12px] text-cyan-200/60">
                  Method: {String(row?.methodId || "—").toUpperCase()}
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-800/40 bg-gray-900/40 p-4">
                <div className="text-[12px] text-cyan-200/70 font-bold">
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
                <div className="mt-2 text-[12px] text-cyan-200/60">
                  {createdAt}
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-800/40 bg-gray-900/40 p-4">
                <div className="text-[12px] text-cyan-200/70 font-bold">
                  Balance Snapshot
                </div>
                <div className="mt-1 text-[13px] text-white">
                  Before: {money(row?.balanceBefore || 0, sym)}
                </div>
                <div className="text-[13px] text-white">
                  After: {money(row?.balanceAfter || 0, sym)}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-cyan-800/40 bg-gray-900/40 p-4">
                <div className="text-[14px] font-extrabold text-cyan-100">
                  Request Info
                </div>

                <div className="mt-3">
                  <FieldRow k="Method ID" v={row?.methodId} />
                  <FieldRow k="Status" v={statusText} />
                  <FieldRow k="Created At" v={createdAt} />
                </div>

                {row?.adminNote ? (
                  <div className="mt-4 rounded-2xl border border-cyan-800/30 bg-gray-900/30 p-3">
                    <div className="text-[12px] font-extrabold text-cyan-200/80">
                      Admin Note
                    </div>
                    <div className="mt-1 text-[13px] text-white">
                      {row.adminNote}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-cyan-800/40 bg-gray-900/40 p-4">
                <div className="text-[14px] font-extrabold text-cyan-100">
                  Submitted Fields
                </div>

                <div className="mt-3 rounded-2xl border border-cyan-800/30 bg-gray-900/30 p-3">
                  {fields && Object.keys(fields).length ? (
                    Object.keys(fields).map((k) => (
                      <FieldRow key={k} k={k} v={String(fields[k] ?? "")} />
                    ))
                  ) : (
                    <div className="py-3 text-[13px] text-cyan-200/70">
                      No submitted fields.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawHistoryDetails;
