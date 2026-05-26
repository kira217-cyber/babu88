import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import {
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import Loading from "../Loading/Loading";

const RESULT_TYPES = ["", "win", "loss", "push"];

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

const resultClass = (type) => {
  const t = String(type || "").toLowerCase();

  if (t === "win") {
    return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20";
  }

  if (t === "loss") {
    return "bg-red-500/10 text-red-700 border border-red-500/20";
  }

  if (t === "push") {
    return "bg-blue-500/10 text-blue-700 border border-blue-500/20";
  }

  return "bg-black/5 text-black/70 border border-black/10";
};

const netClass = (value) => {
  const num = Number(value || 0);

  if (num > 0) return "text-emerald-700";
  if (num < 0) return "text-red-700";

  return "text-blue-700";
};

const InfoRow = ({ label, value, valueClass = "text-black/80" }) => (
  <div className="flex items-start justify-between gap-3 py-2 border-b border-black/5 last:border-b-0">
    <div className="text-[12px] font-bold text-black/45">{label}</div>
    <div
      className={`text-[12px] font-semibold text-right break-all ${valueClass}`}
    >
      {value || "-"}
    </div>
  </div>
);

const SummaryMini = ({ label, value, valueClass = "text-black" }) => (
  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
    <p className="text-[11px] font-bold text-black/45">{label}</p>
    <p className={`mt-1 text-[14px] font-extrabold ${valueClass}`}>{value}</p>
  </div>
);

const BetHistory = () => {
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [q, setQ] = useState("");
  const [resultType, setResultType] = useState("");
  const [providerCode, setProviderCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit,
      q: q || undefined,
      resultType: resultType || undefined,
      providerCode: providerCode || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [page, limit, q, resultType, providerCode, from, to],
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
  const summary = data?.summary || {};

  const clearFilters = () => {
    setPage(1);
    setQ("");
    setResultType("");
    setProviderCode("");
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

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryMini
          label="Total Bet"
          value={fmtMoney(summary.totalBetAmount)}
        />
        <SummaryMini
          label="Total Win"
          value={fmtMoney(summary.totalWinAmount)}
          valueClass="text-emerald-700"
        />
        <SummaryMini
          label="Total Loss"
          value={fmtMoney(summary.totalLossAmount)}
          valueClass="text-red-700"
        />
        <SummaryMini
          label="Net"
          value={fmtMoney(summary.totalNetAmount)}
          valueClass={netClass(summary.totalNetAmount)}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Search game uid / round / serial"
          className="h-10 rounded-lg border border-black/15 px-3 text-[13px] outline-none"
        />

        <select
          value={resultType}
          onChange={(e) => {
            setPage(1);
            setResultType(e.target.value);
          }}
          className="h-10 rounded-lg border border-black/15 px-3 text-[13px] outline-none bg-white"
        >
          {RESULT_TYPES.map((item) => (
            <option key={item || "all"} value={item}>
              {item ? item : "All Results"}
            </option>
          ))}
        </select>

        <input
          value={providerCode}
          onChange={(e) => {
            setPage(1);
            setProviderCode(e.target.value.toUpperCase());
          }}
          placeholder="Provider Code (e.g. PG)"
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
            <table className="min-w-[1200px] w-full text-left">
              <thead className="bg-[#f7f7f8]">
                <tr className="text-[12px] text-black/65">
                  <th className="px-3 py-2 font-extrabold">Time</th>
                  {/* <th className="px-3 py-2 font-extrabold">Provider</th> */}
                  <th className="px-3 py-2 font-extrabold">Game</th>
                  <th className="px-3 py-2 font-extrabold">Result</th>
                  <th className="px-3 py-2 font-extrabold">Bet</th>
                  <th className="px-3 py-2 font-extrabold">Win</th>
                  <th className="px-3 py-2 font-extrabold">Net</th>
                  <th className="px-3 py-2 font-extrabold">Balance After</th>
                  <th className="px-3 py-2 font-extrabold">Round</th>
                  <th className="px-3 py-2 font-extrabold">Serial</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((x, idx) => (
                  <tr
                    key={x._id || x.serial_number || `${x.createdAt}-${idx}`}
                    className="border-t border-black/5 text-[13px]"
                  >
                    <td className="px-3 py-2">{fmtDateTime(x.createdAt)}</td>
                    {/* <td className="px-3 py-2 font-semibold">
                      {x.provider || "-"}
                    </td> */}
                    <td className="px-3 py-2">
                      <div className="font-semibold">
                        {x.gameName || x.game_uid || "-"}
                      </div>
                      <div className="text-[11px] text-black/45 break-all">
                        {x.game_uid || "-"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-[3px] rounded-md text-[12px] font-bold capitalize ${resultClass(
                          x.resultType,
                        )}`}
                      >
                        {x.resultType || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {fmtMoney(x.bet_amount)}
                    </td>
                    <td className="px-3 py-2 text-emerald-700">
                      {fmtMoney(x.win_amount)}
                    </td>
                    <td
                      className={`px-3 py-2 font-extrabold ${netClass(
                        x.net_amount,
                      )}`}
                    >
                      {fmtMoney(x.net_amount)}
                    </td>
                    <td className="px-3 py-2">{fmtMoney(x.balance_after)}</td>
                    <td className="px-3 py-2 text-[12px] text-black/70 break-all">
                      {x.game_round || "-"}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-black/70 break-all">
                      {x.serial_number || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                key={x._id || x.serial_number || `${x.createdAt}-${idx}`}
                className="rounded-xl border border-black/10 bg-white overflow-hidden"
              >
                <div className="p-3 border-b border-black/5 bg-[#fafafa]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[12px] font-bold text-black/50">
                      {fmtDateTime(x.createdAt)}
                    </div>

                    <span
                      className={`px-2 py-[3px] rounded-md text-[11px] font-bold capitalize ${resultClass(
                        x.resultType,
                      )}`}
                    >
                      {x.resultType || "-"}
                    </span>
                  </div>

                  <div className="mt-2 text-[14px] font-extrabold text-black">
                    {x.provider || "-"} • {x.gameName || x.game_uid || "-"}
                  </div>
                </div>

                <div className="p-3">
                  <InfoRow label="Bet Amount" value={fmtMoney(x.bet_amount)} />
                  <InfoRow label="Win Amount" value={fmtMoney(x.win_amount)} />
                  <InfoRow
                    label="Net"
                    value={fmtMoney(x.net_amount)}
                    valueClass={netClass(x.net_amount)}
                  />
                  <InfoRow
                    label="Balance After"
                    value={fmtMoney(x.balance_after)}
                  />
                  <InfoRow label="Game UID" value={x.game_uid} />
                  <InfoRow label="Round" value={x.game_round} />
                  <InfoRow label="Serial" value={x.serial_number} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
