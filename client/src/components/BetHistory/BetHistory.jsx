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

const PROVIDER_TYPES = [
  { value: "", label: "All Providers" },
  { value: "oracle", label: "Oracle" },
  { value: "ninewicket", label: "NineWicket" },
];

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
      {value !== undefined && value !== null && String(value).trim() !== ""
        ? value
        : "-"}
    </div>
  </div>
);

const SummaryMini = ({ label, value, valueClass = "text-black" }) => (
  <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
    <p className="text-[11px] font-bold text-black/45">{label}</p>

    <p className={`mt-1 text-[14px] font-extrabold ${valueClass}`}>{value}</p>
  </div>
);

const isNineWicketRow = (row) => {
  const provider = String(row?.provider || row?.displayProviderName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  return (
    provider === "ninewicket" ||
    provider === "nine-wicket" ||
    Boolean(row?.nineWicketUsername) ||
    Boolean(row?.nineWicketBetId)
  );
};

const getProviderName = (row) => {
  if (isNineWicketRow(row)) {
    return "NineWicket";
  }

  return (
    row?.displayProviderName ||
    row?.providerName ||
    row?.providerCode ||
    row?.provider ||
    "Oracle"
  );
};

const getGameTitle = (row) => {
  if (isNineWicketRow(row)) {
    return (
      row?.eventName ||
      row?.displayGameName ||
      row?.competitionName ||
      "NineWicket"
    );
  }

  return (
    row?.displayGameName ||
    row?.gameName ||
    row?.oracleGameName ||
    row?.game_uid ||
    "-"
  );
};

const getGameSubtitle = (row) => {
  if (isNineWicketRow(row)) {
    return (
      [row?.eventTypeName, row?.competitionName, row?.marketName]
        .filter(Boolean)
        .join(" • ") ||
      row?.game_uid ||
      "-"
    );
  }

  return row?.game_uid || "-";
};

const getBetAmount = (row) => {
  if (isNineWicketRow(row)) {
    return Number(
      row?.displayBetAmount ?? row?.matchStake ?? row?.bet_amount ?? 0,
    );
  }

  return Number(row?.bet_amount || 0);
};

const getUsername = (row) => {
  if (isNineWicketRow(row)) {
    return (
      row?.nineWicketUsername ||
      row?.displayUsername ||
      row?.member_account ||
      "-"
    );
  }

  return (
    row?.userGamePlayName || row?.displayUsername || row?.member_account || "-"
  );
};

const getEventTypeName = (row) => {
  return String(row?.eventTypeName || "").trim() || "-";
};

const getEventName = (row) => {
  return String(row?.eventName || "").trim() || "-";
};

const getMarketName = (row) => {
  return String(row?.marketName || "").trim() || "-";
};

const getCompetitionName = (row) => {
  return String(row?.competitionName || "").trim() || "-";
};

const BetHistory = () => {
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [q, setQ] = useState("");
  const [resultType, setResultType] = useState("");
  const [provider, setProvider] = useState("");
  const [providerCode, setProviderCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit,
      q: q || undefined,
      resultType: resultType || undefined,
      provider: provider || undefined,

      providerCode:
        provider === "ninewicket" ? undefined : providerCode || undefined,

      from: from || undefined,
      to: to || undefined,
    }),
    [page, limit, q, resultType, provider, providerCode, from, to],
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["me-bet-history", user?._id, params],

    enabled: Boolean(isAuth),

    queryFn: async () => {
      const res = await api.get("/api/me/bet-history", {
        params,
      });

      return res.data;
    },

    staleTime: 10_000,
    retry: 1,
  });

  const rows = Array.isArray(data?.data) ? data.data : [];

  const totalPages = Number(data?.totalPages || 1);

  const total = Number(data?.total || 0);

  const summary = data?.summary || {};

  const clearFilters = () => {
    setPage(1);
    setQ("");
    setResultType("");
    setProvider("");
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
          placeholder="Search game / event / round / serial"
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
              {item || "All Results"}
            </option>
          ))}
        </select>

        <select
          value={provider}
          onChange={(e) => {
            const value = e.target.value;

            setPage(1);
            setProvider(value);

            if (value === "ninewicket") {
              setProviderCode("");
            }
          }}
          className="h-10 rounded-lg border border-black/15 px-3 text-[13px] outline-none bg-white"
        >
          {PROVIDER_TYPES.map((item) => (
            <option key={item.value || "all"} value={item.value}>
              {item.label}
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
          disabled={provider === "ninewicket"}
          className="h-10 rounded-lg border border-black/15 px-3 text-[13px] outline-none disabled:bg-black/[0.03] disabled:text-black/35 disabled:cursor-not-allowed"
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

      {/* =================================================
          DESKTOP TABLE
      ================================================= */}

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
            <table className="min-w-[1900px] w-full text-left">
              <thead className="bg-[#f7f7f8]">
                <tr className="text-[12px] text-black/65">
                  <th className="px-3 py-2 font-extrabold">Time</th>

                  <th className="px-3 py-2 font-extrabold">Provider</th>

                  <th className="px-3 py-2 font-extrabold">Game</th>

                  <th className="px-3 py-2 font-extrabold">Result</th>

                  <th className="px-3 py-2 font-extrabold">Bet</th>

                  <th className="px-3 py-2 font-extrabold">Win</th>

                  <th className="px-3 py-2 font-extrabold">Net</th>

                  <th className="px-3 py-2 font-extrabold">Balance After</th>

                  <th className="px-3 py-2 font-extrabold">Round</th>

                  <th className="px-3 py-2 font-extrabold">Serial</th>

                  <th className="px-3 py-2 font-extrabold">Event Type</th>

                  <th className="px-3 py-2 font-extrabold">Event Name</th>

                  <th className="px-3 py-2 font-extrabold">Market Name</th>

                  <th className="px-3 py-2 font-extrabold">Competition Name</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((x, idx) => {
                  const nineWicket = isNineWicketRow(x);

                  return (
                    <tr
                      key={x._id || x.serial_number || `${x.createdAt}-${idx}`}
                      className="border-t border-black/5 text-[13px]"
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        {fmtDateTime(x.createdAt)}
                      </td>

                      <td className="px-3 py-2 font-semibold">
                        {getProviderName(x)}
                      </td>

                      <td className="px-3 py-2">
                        <div className="font-semibold">{getGameTitle(x)}</div>

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
                        {fmtMoney(getBetAmount(x))}
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

                      <td className="px-3 py-2 text-[12px] text-black/70">
                        {nineWicket ? getEventTypeName(x) : "-"}
                      </td>

                      <td className="px-3 py-2 text-[12px] text-black/70 min-w-[180px]">
                        {nineWicket ? getEventName(x) : "-"}
                      </td>

                      <td className="px-3 py-2 text-[12px] text-black/70 min-w-[130px]">
                        {nineWicket ? getMarketName(x) : "-"}
                      </td>

                      <td className="px-3 py-2 text-[12px] text-black/70 min-w-[150px]">
                        {nineWicket ? getCompetitionName(x) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================
          MOBILE CARDS
      ================================================= */}

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
            {rows.map((x, idx) => {
              const nineWicket = isNineWicketRow(x);

              return (
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
                      {getProviderName(x)} • {getGameTitle(x)}
                    </div>

                    <div className="mt-1 text-[11px] text-black/45">
                      {getGameSubtitle(x)}
                    </div>
                  </div>

                  <div className="p-3">
                    <InfoRow label="Username" value={getUsername(x)} />

                    {nineWicket && (
                      <>
                        <InfoRow
                          label="Event Type Name"
                          value={getEventTypeName(x)}
                        />

                        <InfoRow label="Event Name" value={getEventName(x)} />

                        <InfoRow label="Market Name" value={getMarketName(x)} />

                        <InfoRow
                          label="Competition Name"
                          value={getCompetitionName(x)}
                        />
                      </>
                    )}

                    <InfoRow
                      label="Bet Amount"
                      value={fmtMoney(getBetAmount(x))}
                    />

                    <InfoRow
                      label="Win Amount"
                      value={fmtMoney(x.win_amount)}
                    />

                    <InfoRow
                      label="Net"
                      value={fmtMoney(x.net_amount)}
                      valueClass={netClass(x.net_amount)}
                    />

                    <InfoRow
                      label="Balance After"
                      value={fmtMoney(x.balance_after)}
                    />

                    {nineWicket && (
                      <>
                        <InfoRow
                          label="Match Stake"
                          value={fmtMoney(x.matchStake)}
                        />

                        <InfoRow
                          label="Profit/Loss"
                          value={fmtMoney(x.profitLoss)}
                          valueClass={netClass(x.profitLoss)}
                        />

                        <InfoRow
                          label="Bet Status"
                          value={x.nineWicketBetStatus}
                        />
                      </>
                    )}

                    <InfoRow label="Game UID" value={x.game_uid} />

                    <InfoRow label="Round" value={x.game_round} />

                    <InfoRow label="Serial" value={x.serial_number} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

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
