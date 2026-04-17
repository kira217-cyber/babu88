import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import Loading from "../Loading/Loading";

const fmtMoney = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const fmtDateTime = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString();
};

const statusClass = (status) => {
  const s = String(status || "").toLowerCase();

  if (["won", "settled"].includes(s)) {
    return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20";
  }

  if (["lost", "error", "void"].includes(s)) {
    return "bg-red-500/10 text-red-700 border border-red-500/20";
  }

  if (["refunded", "cancelled"].includes(s)) {
    return "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20";
  }

  return "bg-black/5 text-black/70 border border-black/10";
};

const typeClass = (type) => {
  const t = String(type || "").toUpperCase();

  if (t === "BET")
    return "bg-blue-500/10 text-blue-700 border border-blue-500/20";
  if (["SETTLE", "BONUS", "PROMO"].includes(t)) {
    return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20";
  }
  if (["REFUND", "CANCEL", "CANCELBET"].includes(t)) {
    return "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20";
  }

  return "bg-black/5 text-black/70 border border-black/10";
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 py-2 border-b border-black/5 last:border-b-0">
    <div className="text-[12px] font-bold text-black/45">{label}</div>
    <div className="text-[12px] font-semibold text-black/80 text-right break-all">
      {value || "-"}
    </div>
  </div>
);

const BetHistory = () => {
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [status, setStatus] = useState("");
  const [betType, setBetType] = useState("");
  const [provider, setProvider] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit,
      status: status || undefined,
      bet_type: betType || undefined,
      provider_code: provider || undefined,
      game_code: gameCode || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [page, limit, status, betType, provider, gameCode, from, to],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["me-bet-history", user?._id, params],
    enabled: !!isAuth,
    queryFn: async () => {
      const res = await api.get("/api/me/bet-history", { params });
      return res.data;
    },
    staleTime: 10_000,
    retry: 1,
  });

  const rows = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const clearFilters = () => {
    setPage(1);
    setStatus("");
    setBetType("");
    setProvider("");
    setGameCode("");
    setFrom("");
    setTo("");
  };

  if (!isAuth) {
    return (
      <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="text-[14px] font-extrabold text-black">Bet History</div>
        <p className="mt-2 text-[13px] text-black/60">
          Please login to view your bet history.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-black/10 p-4 md:p-5 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <Loading open={isLoading} text="Loading bet history..." />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-[16px] font-extrabold text-black">
            Bet History
          </div>
          <div className="text-[12px] text-black/55 mt-1">
            Showing {rows.length} items • Total {total} • Page {page}/
            {totalPages}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearFilters}
            className="h-10 px-4 rounded-lg border border-black/15 bg-white text-black font-extrabold text-[13px] hover:bg-black/[0.03]"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            className="h-10 px-4 rounded-lg bg-black text-[#f5c400] font-extrabold text-[13px] hover:brightness-95"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="h-10 rounded-lg border border-black/15 px-3 text-[13px] outline-none bg-white"
        >
          <option value="">All Status</option>
          <option value="pending">pending</option>
          <option value="bet">bet</option>
          <option value="settled">settled</option>
          <option value="won">won</option>
          <option value="lost">lost</option>
          <option value="push">push</option>
          <option value="cancelled">cancelled</option>
          <option value="refunded">refunded</option>
          <option value="error">error</option>
          <option value="void">void</option>
        </select>

        <select
          value={betType}
          onChange={(e) => {
            setPage(1);
            setBetType(e.target.value);
          }}
          className="h-10 rounded-lg border border-black/15 px-3 text-[13px] outline-none bg-white"
        >
          <option value="">All Bet Types</option>
          <option value="BET">BET</option>
          <option value="SETTLE">SETTLE</option>
          <option value="CANCEL">CANCEL</option>
          <option value="REFUND">REFUND</option>
          <option value="BONUS">BONUS</option>
          <option value="PROMO">PROMO</option>
          <option value="CANCELBET">CANCELBET</option>
        </select>

        <input
          value={provider}
          onChange={(e) => {
            setPage(1);
            setProvider(e.target.value.toUpperCase());
          }}
          placeholder="Provider (e.g. EVO)"
          className="h-10 rounded-lg border border-black/15 px-3 text-[13px] outline-none"
        />

        <input
          value={gameCode}
          onChange={(e) => {
            setPage(1);
            setGameCode(e.target.value);
          }}
          placeholder="Game code"
          className="h-10 rounded-lg border border-black/15 px-3 text-[13px] outline-none"
        />

        <input
          type="date"
          value={from}
          onChange={(e) => {
            setPage(1);
            setFrom(e.target.value);
          }}
          className="h-10 rounded-lg border border-black/15 px-3 text-[13px] outline-none"
        />

        <input
          type="date"
          value={to}
          onChange={(e) => {
            setPage(1);
            setTo(e.target.value);
          }}
          className="h-10 rounded-lg border border-black/15 px-3 text-[13px] outline-none"
        />
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden lg:block">
        {isLoading ? (
          <div className="text-[13px] text-black/60 py-10 text-center">
            Loading bet history...
          </div>
        ) : isError ? (
          <div className="text-[13px] text-red-600 py-10 text-center">
            Failed to load bet history.
          </div>
        ) : rows.length === 0 ? (
          <div className="text-[13px] text-black/60 py-10 text-center">
            No bet history found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-black/10">
            <table className="min-w-[1250px] w-full text-left">
              <thead className="bg-[#f7f7f8]">
                <tr className="text-[12px] text-black/65">
                  <th className="px-3 py-2 font-extrabold">Time</th>
                  <th className="px-3 py-2 font-extrabold">Provider</th>
                  <th className="px-3 py-2 font-extrabold">Game</th>
                  <th className="px-3 py-2 font-extrabold">Type</th>
                  <th className="px-3 py-2 font-extrabold">Status</th>
                  <th className="px-3 py-2 font-extrabold">Amount</th>
                  <th className="px-3 py-2 font-extrabold">Win</th>
                  <th className="px-3 py-2 font-extrabold">Balance After</th>
                  <th className="px-3 py-2 font-extrabold">Txn ID</th>
                  <th className="px-3 py-2 font-extrabold">Verification</th>
                  <th className="px-3 py-2 font-extrabold">Round</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x, idx) => (
                  <tr
                    key={
                      x._id ||
                      x.verification_key ||
                      x.transaction_id ||
                      `${x.createdAt}-${idx}`
                    }
                    className="border-t border-black/5 text-[13px]"
                  >
                    <td className="px-3 py-2">{fmtDateTime(x.createdAt)}</td>
                    <td className="px-3 py-2 font-semibold">
                      {x.provider_code || "-"}
                    </td>
                    <td className="px-3 py-2">{x.game_code || "-"}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-[3px] rounded-md text-[12px] font-bold ${typeClass(
                          x.bet_type,
                        )}`}
                      >
                        {x.bet_type || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-[3px] rounded-md text-[12px] font-bold ${statusClass(
                          x.status,
                        )}`}
                      >
                        {x.status || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {fmtMoney(x.amount)}
                    </td>
                    <td className="px-3 py-2">{fmtMoney(x.win_amount)}</td>
                    <td className="px-3 py-2">{fmtMoney(x.balance_after)}</td>
                    <td className="px-3 py-2 text-[12px] text-black/70 break-all">
                      {x.transaction_id || "-"}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-black/70 break-all">
                      {x.verification_key || "-"}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-black/70 break-all">
                      {x.round_id || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile / tablet cards */}
      <div className="mt-4 lg:hidden">
        {isLoading ? (
          <div className="text-[13px] text-black/60 py-10 text-center">
            Loading bet history...
          </div>
        ) : isError ? (
          <div className="text-[13px] text-red-600 py-10 text-center">
            Failed to load bet history.
          </div>
        ) : rows.length === 0 ? (
          <div className="text-[13px] text-black/60 py-10 text-center">
            No bet history found.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((x, idx) => (
              <div
                key={
                  x._id ||
                  x.verification_key ||
                  x.transaction_id ||
                  `${x.createdAt}-${idx}`
                }
                className="rounded-xl border border-black/10 bg-white overflow-hidden"
              >
                <div className="p-3 border-b border-black/5 bg-[#fafafa]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[12px] font-bold text-black/50">
                      {fmtDateTime(x.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-[3px] rounded-md text-[11px] font-bold ${typeClass(
                          x.bet_type,
                        )}`}
                      >
                        {x.bet_type || "-"}
                      </span>
                      <span
                        className={`px-2 py-[3px] rounded-md text-[11px] font-bold ${statusClass(
                          x.status,
                        )}`}
                      >
                        {x.status || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-[14px] font-extrabold text-black">
                    {x.provider_code || "-"} • {x.game_code || "-"}
                  </div>
                </div>

                <div className="p-3">
                  <InfoRow label="Amount" value={fmtMoney(x.amount)} />
                  <InfoRow label="Win" value={fmtMoney(x.win_amount)} />
                  <InfoRow
                    label="Balance After"
                    value={fmtMoney(x.balance_after)}
                  />
                  <InfoRow label="Transaction ID" value={x.transaction_id} />
                  <InfoRow
                    label="Verification Key"
                    value={x.verification_key}
                  />
                  <InfoRow label="Round ID" value={x.round_id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
          className={`h-10 px-4 rounded-lg font-extrabold text-[13px] ${
            page <= 1
              ? "bg-black/10 text-black/40 cursor-not-allowed"
              : "bg-black text-white hover:brightness-95"
          }`}
        >
          Prev
        </button>

        <div className="text-[12px] text-black/60">
          Page <span className="font-extrabold text-black/80">{page}</span> of{" "}
          <span className="font-extrabold text-black/80">{totalPages}</span>
        </div>

        <button
          type="button"
          onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
          disabled={page >= totalPages}
          className={`h-10 px-4 rounded-lg font-extrabold text-[13px] ${
            page >= totalPages
              ? "bg-black/10 text-black/40 cursor-not-allowed"
              : "bg-black text-white hover:brightness-95"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BetHistory;
