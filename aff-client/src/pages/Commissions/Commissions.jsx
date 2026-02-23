import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "../../features/auth/authSelectors";
import { api } from "../../api/axios";
import {
  FaSyncAlt,
  FaWallet,
  FaChartLine,
  FaCoins,
  FaGamepad,
  FaArrowDown,
  FaArrowUp,
  FaUsers,
} from "react-icons/fa";

const fmtMoney = (n, symbol = "৳") => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return `${symbol} 0.00`;
  return `${symbol} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const Card = ({ icon: Icon, title, value, subtitle, accent = "cyan" }) => {
  const accentCls =
    accent === "teal"
      ? "border-teal-500/35 shadow-teal-600/15"
      : accent === "emerald"
        ? "border-emerald-500/35 shadow-emerald-600/15"
        : accent === "amber"
          ? "border-amber-500/35 shadow-amber-600/15"
          : "border-cyan-500/35 shadow-cyan-600/15";

  return (
    <div
      className={`rounded-2xl border ${accentCls} bg-black/35 p-5 shadow-lg`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
            <Icon className="text-xl text-white/90" />
          </div>
          <div>
            <div className="text-[13px] font-extrabold text-white/90">
              {title}
            </div>
            {subtitle ? (
              <div className="mt-0.5 text-[12px] text-white/60">
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[18px] font-black text-white">{value}</div>
        </div>
      </div>
    </div>
  );
};

const Skeleton = () => (
  <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="h-[96px] rounded-2xl bg-white/10 animate-pulse"
      />
    ))}
  </div>
);

const Commissions = () => {
  const token = useSelector(selectToken);
  const me = useSelector(selectUser);

  const symbol = useMemo(() => {
    const c = me?.currency || "BDT";
    return c === "USDT" ? "$" : "৳";
  }, [me?.currency]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);

  const headers = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await api.get("/api/affiliate/commissions/me", { headers });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Fetch failed");
      }
      setData(res.data.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Server error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalWallet = useMemo(() => {
    if (!data) return 0;
    return (
      Number(data.gameLossCommissionBalance || 0) +
      Number(data.depositCommissionBalance || 0) +
      Number(data.referCommissionBalance || 0) 
    );
  }, [data]);

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto rounded-2xl border border-cyan-800/45 bg-gradient-to-b from-gray-950 via-cyan-950/20 to-gray-950 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-cyan-800/45 bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-700">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-black/35 flex items-center justify-center shadow-lg shadow-cyan-900/20">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight">
                  Commissions
                </div>
                <div className="text-xs text-white/85">
                  Your rates & earnings wallets
                </div>
              </div>
            </div>

            <button
              onClick={() => fetchData(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold text-black bg-white/90 hover:bg-white transition border border-black/20 disabled:opacity-60"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <Skeleton />
        ) : !data ? (
          <div className="p-10 text-center text-white/70">
            No data found
          </div>
        ) : (
          <div className="p-5 md:p-6 space-y-6">
            {/* Top Summary */}
            <div className="rounded-2xl border border-cyan-800/45 bg-black/35 p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <FaWallet className="text-xl text-white/90" />
                  </div>
                  <div>
                    <div className="text-[13px] font-extrabold text-white/90">
                      Total Earnings Wallet
                    </div>
                    <div className="mt-0.5 text-[12px] text-white/60">
                      Combined balance of all commission wallets
                    </div>
                  </div>
                </div>

                <div className="text-[22px] font-black text-white">
                  {fmtMoney(totalWallet, symbol)}
                </div>
              </div>
            </div>

            {/* Rates */}
            <div>
              <div className="text-[14px] font-extrabold text-white/90 mb-3">
                Commission Rates
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card
                  icon={FaArrowDown}
                  title="Game Loss Commission"
                  subtitle="Rate / config"
                  value={fmtMoney(data.gameLossCommission, symbol)}
                  accent="cyan"
                />
                <Card
                  icon={FaCoins}
                  title="Deposit Commission"
                  subtitle="Rate / config"
                  value={fmtMoney(data.depositCommission, symbol)}
                  accent="amber"
                />
                <Card
                  icon={FaUsers}
                  title="Referral Commission"
                  subtitle="Per referral payout"
                  value={fmtMoney(data.referCommission, symbol)}
                  accent="teal"
                />
                <Card
                  icon={FaArrowUp}
                  title="Game Win Commission"
                  subtitle="Rate / config"
                  value={fmtMoney(data.gameWinCommission, symbol)}
                  accent="emerald"
                />
              </div>
            </div>

            {/* Wallets */}
            <div>
              <div className="text-[14px] font-extrabold text-white/90 mb-3">
                Commission Wallets
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card
                  icon={FaGamepad}
                  title="Game Loss Wallet"
                  subtitle="Earned from loss commission"
                  value={fmtMoney(data.gameLossCommissionBalance, symbol)}
                  accent="cyan"
                />
                <Card
                  icon={FaCoins}
                  title="Deposit Wallet"
                  subtitle="Earned from deposit commission"
                  value={fmtMoney(data.depositCommissionBalance, symbol)}
                  accent="amber"
                />
                <Card
                  icon={FaUsers}
                  title="Referral Wallet"
                  subtitle="Earned from referrals"
                  value={fmtMoney(data.referCommissionBalance, symbol)}
                  accent="teal"
                />
                <Card
                  icon={FaArrowUp}
                  title="Game Win Wallet"
                  subtitle="Earned from win commission"
                  value={fmtMoney(data.gameWinCommissionBalance, symbol)}
                  accent="emerald"
                />
              </div>
            </div>

            {/* Small Hint */}
            <div className="text-[12px] text-white/60 text-center">
              Tip: Refresh to see the latest wallet balances after updates.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Commissions;