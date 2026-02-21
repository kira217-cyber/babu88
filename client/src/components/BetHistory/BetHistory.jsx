import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";

const fmtMoney = (n) => {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDateTime = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString();
};

const BetHistory = () => {
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // filters + pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [status, setStatus] = useState("");
  const [betType, setBetType] = useState("");
  const [provider, setProvider] = useState("");
  const [gameCode, setGameCode] = useState("");

  // quick date range (optional)
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

  if (!isAuth) {
    return (
      <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="text-[14px] font-extrabold text-black">Bet History</div>
        <p className="mt-2 text-[13px] text-black/60">Please login to view your bet history.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-black/10 p-4 md:p-5 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-[16px] font-extrabold text-black">Bet History</div>
          <div className="text-[12px] text-black/55 mt-1">
            Showing {rows.length} items • Page {page}/{totalPages}
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="h-10 px-4 rounded-lg bg-black text-[#f5c400] font-extrabold text-[13px] hover:brightness-95"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="h-10 rounded-lg border border-black/15 px-3 text-[13px] outline-none"
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
          className="h-10 rounded-lg border border-black/15 px-3 text-[13px] outline-none"
        >
          <option value="">All Bet Types</option>
          <option value="BET">BET</option>
          <option value="SETTLE">SETTLE</option>
          <option value="CANCEL">CANCEL</option>
          <option value="REFUND">REFUND</option>
          <option value="BONUS">BONUS</option>
          <option value="PROMO">PROMO</option>
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

      {/* Content */}
      <div className="mt-4">
        {isLoading ? (
          <div className="text-[13px] text-black/60 py-10 text-center">Loading bet history...</div>
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
            <table className="min-w-[980px] w-full text-left">
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
                </tr>
              </thead>
              <tbody>
                {rows.map((x, idx) => (
                  <tr key={x.transaction_id || `${x.createdAt}-${idx}`} className="border-t border-black/5 text-[13px]">
                    <td className="px-3 py-2">{fmtDateTime(x.createdAt)}</td>
                    <td className="px-3 py-2 font-semibold">{x.provider_code || "-"}</td>
                    <td className="px-3 py-2">{x.game_code || "-"}</td>
                    <td className="px-3 py-2">{x.bet_type || "-"}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-[2px] rounded-md bg-black/5 font-semibold">
                        {x.status || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{fmtMoney(x.amount)}</td>
                    <td className="px-3 py-2">{fmtMoney(x.win_amount)}</td>
                    <td className="px-3 py-2">{fmtMoney(x.balance_after)}</td>
                    <td className="px-3 py-2 text-[12px] text-black/70">{x.transaction_id || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            page <= 1 ? "bg-black/10 text-black/40 cursor-not-allowed" : "bg-black text-white hover:brightness-95"
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