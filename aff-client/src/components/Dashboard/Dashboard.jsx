import React, { useEffect, useMemo, useState } from "react";
import {
  FaUsers,
  FaWallet,
  FaChartLine,
  FaCopy,
  FaEye,
  FaShareAlt,
  FaSyncAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { api } from "../../api/axios";
import { selectToken, selectUser } from "../../features/auth/authSelectors";
import { Link } from "react-router";

// ✅ Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
);

const money = (n, currency = "BDT") => {
  const symbol = currency === "USDT" ? "$" : "৳";
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return `${symbol} 0.00`;
  return `${symbol} ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white/10 animate-pulse h-[110px]" />
);

const SkeletonBox = ({ h = "h-64" }) => (
  <div className={`${h} rounded-xl bg-white/10 animate-pulse`} />
);

const Dashboard = () => {
  const [copied, setCopied] = useState(false);

  const token = useSelector(selectToken);
  const reduxUser = useSelector(selectUser);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [dash, setDash] = useState(null);

  // ✅ chart state
  const [chartLoading, setChartLoading] = useState(true);
  const [earningsChart, setEarningsChart] = useState(null);
  const [days, setDays] = useState(30); // 7/14/30/60

  // ✅ base url (prefer env)
  const baseUrl = (import.meta.env.VITE_CLIENT_URL || "").trim();

  const referralLink = useMemo(() => {
    const code = (reduxUser?.referralCode || "").trim();
    if (!baseUrl) return "";
    if (!code) return `${baseUrl}/register`;
    return `${baseUrl}/register?ref=${encodeURIComponent(code)}`;
  }, [reduxUser?.referralCode, baseUrl]);

  const headers = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { data } = await api.get("/api/affiliate/dashboard/me", {
        headers,
      });
      if (!data?.success) throw new Error(data?.message || "Fetch failed");

      setDash(data.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Server error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEarningsChart = async (d = days) => {
    try {
      setChartLoading(true);
      const { data } = await api.get("/api/affiliate/dashboard/earnings", {
        headers,
        params: { days: d },
      });
      if (!data?.success)
        throw new Error(data?.message || "Chart fetch failed");
      setEarningsChart(data.data);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e?.message || "Chart load failed",
      );
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchEarningsChart(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const onRefreshAll = async () => {
    await fetchDashboard(true);
    await fetchEarningsChart(days);
    toast.info("Refreshed");
  };

  const copyToClipboard = async () => {
    try {
      if (!referralLink) {
        toast.error("Referral link পাওয়া যায়নি");
        return;
      }
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied!", { autoClose: 2000 });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const currency = dash?.affiliate?.currency || reduxUser?.currency || "BDT";

  const stats = useMemo(() => {
    const s = dash?.stats || {};
    return [
      {
        title: "Total Referrals",
        value: String(s.totalReferrals ?? 0),
        change: `+${String(s.thisMonthNewReferrals ?? 0)}`,
        changeHint: "new this month",
        icon: <FaUsers className="text-3xl" />,
        color: "from-cyan-500 to-teal-600",
      },
      {
        title: "Active Referrals",
        value: String(s.activeReferrals ?? 0),
        change: "",
        changeHint: "active users",
        icon: <FaEye className="text-3xl" />,
        color: "from-emerald-500 to-teal-600",
      },
      {
        title: "Total Commission",
        value: money(s.totalCommissionEarned ?? 0, currency),
        change: "",
        changeHint: "total wallet",
        icon: <FaWallet className="text-3xl" />,
        color: "from-purple-500 to-indigo-600",
      },
      {
        title: "This Month Earnings",
        value: money(s.thisMonthEarnings ?? 0, currency),
        change: "",
        changeHint: "referrals-based",
        icon: <FaChartLine className="text-3xl" />,
        color: "from-amber-500 to-orange-600",
      },
    ];
  }, [dash, currency]);

  // ✅ build chart data
  const lineData = useMemo(() => {
    const labels = earningsChart?.labels || [];
    const daily = earningsChart?.dailyEarnings || [];
    const cum = earningsChart?.cumulativeEarnings || [];

    return {
      labels,
      datasets: [
        {
          label: "Daily Earnings",
          data: daily,
          tension: 0.35,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 4,
        },
        {
          label: "Cumulative",
          data: cum,
          tension: 0.35,
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  }, [earningsChart]);

  const lineOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: { color: "rgba(255,255,255,0.75)" },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = Number(ctx.parsed.y || 0);
              const sym = currency === "USDT" ? "$" : "৳";
              return ` ${ctx.dataset.label}: ${sym}${val.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "rgba(255,255,255,0.6)", maxTicksLimit: 8 },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
        y: {
          ticks: {
            color: "rgba(255,255,255,0.6)",
            callback: (v) => {
              const sym = currency === "USDT" ? "$" : "৳";
              return `${sym}${v}`;
            },
          },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
      },
    };
  }, [currency]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-cyan-950/10 to-gray-950 text-gray-100 p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Affiliate Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Welcome back! Here's your performance overview
            </p>
          </div>

          <button
            onClick={onRefreshAll}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold
                       bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500
                       shadow-lg shadow-cyan-700/30 border border-cyan-500/30
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Referral Link Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-800/40 rounded-2xl p-6 mb-8 shadow-xl shadow-cyan-950/30"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                Your Referral Link
              </h3>
              <div className="bg-gray-950 border border-cyan-900/50 rounded-lg px-4 py-3 font-mono text-sm md:text-base break-all">
                {referralLink || "—"}
              </div>

              {!reduxUser?.referralCode ? (
                <p className="text-xs text-amber-300 mt-2">
                  Referral code এখনো সেট হয়নি
                </p>
              ) : null}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={copyToClipboard}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer min-w-[160px] ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg shadow-cyan-700/40"
                }`}
              >
                <FaCopy />
                {copied ? "Copied!" : "Copy Link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  copyToClipboard();
                  toast.info("Share: link copied");
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all duration-300 cursor-pointer"
              >
                <FaShareAlt />
                Share
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
                className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-xl shadow-black/40 transform hover:scale-[1.03] transition-transform duration-300`}
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <p className="text-white/80 text-sm font-medium mb-1">
                      {stat.title}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-bold text-white break-words">
                      {stat.value}
                    </h3>
                  </div>
                  <div className="text-white/90 opacity-90">{stat.icon}</div>
                </div>

                <p className="mt-4 text-sm">
                  {stat.change ? (
                    <span className="text-emerald-200 font-medium">
                      {stat.change}
                    </span>
                  ) : null}
                  <span className="text-white/70 ml-1">{stat.changeHint}</span>
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Analytics / Recent Referrals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ✅ Earnings Overview Card (LIVE CHART) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/70 border border-cyan-800/30 rounded-2xl p-6 shadow-2xl backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-3 mb-6">
              <h3 className="text-xl font-bold text-cyan-300 flex items-center gap-3">
                <FaChartLine className="text-cyan-400" />
                Earnings Overview
              </h3>

              <div className="flex items-center gap-2">
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value || 30))}
                  className="px-3 py-2 rounded-xl bg-gray-950/60 border border-cyan-900/40 text-white text-sm outline-none
                             focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                </select>

                <button
                  type="button"
                  onClick={() => fetchEarningsChart(days)}
                  disabled={chartLoading}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold
                             bg-gradient-to-r from-cyan-700 to-teal-700 hover:from-cyan-600 hover:to-teal-600
                             border border-cyan-500/30 disabled:opacity-60"
                >
                  <FaSyncAlt className={chartLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            <div className="h-64 bg-gray-950/50 rounded-xl border border-cyan-900/40 p-3">
              {chartLoading ? (
                <SkeletonBox h="h-full" />
              ) : earningsChart ? (
                <Line data={lineData} options={lineOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No chart data
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-950/35 border border-cyan-900/30 rounded-xl p-4">
                <p className="text-sm text-gray-400">Total Wallet</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {money(dash?.stats?.totalCommissionEarned ?? 0, currency)}
                </p>
              </div>
              <div className="bg-gray-950/35 border border-cyan-900/30 rounded-xl p-4">
                <p className="text-sm text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-amber-400">
                  {money(dash?.stats?.thisMonthEarnings ?? 0, currency)}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Note: earnings chart এখন referral-based (daily referrals ×
              referCommission). পরে commission ledger যোগ করলে 100% exact হবে।
            </p>
          </motion.div>

          {/* Recent Referrals Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-900/70 border border-cyan-800/30 rounded-2xl p-6 shadow-2xl backdrop-blur-sm"
          >
            <h3 className="text-xl font-bold text-cyan-300 mb-6 flex items-center gap-3">
              <FaUsers className="text-cyan-400" />
              Recent Referrals
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[56px] rounded-lg bg-white/10 animate-pulse"
                  />
                ))}
              </div>
            ) : (dash?.recentReferrals || []).length ? (
              <div className="space-y-4">
                {dash.recentReferrals.map((u) => (
                  <div
                    key={u._id}
                    className="flex justify-between items-center py-3 px-4 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{u.username}</p>
                      <p className="text-xs text-gray-500">
                        {u.phone || "—"} •{" "}
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-300 font-bold">
                        {money(u.balance ?? 0, u.currency || currency)}
                      </div>
                      <div
                        className={`text-[11px] font-bold ${
                          u.isActive ? "text-emerald-300" : "text-red-300"
                        }`}
                      >
                        {u.isActive ? "ACTIVE" : "INACTIVE"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400">
                No referrals found
              </div>
            )}

            <Link to={"/dashboard/my-refer"}>
              <button
                type="button"
                className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-700 to-teal-700 hover:from-cyan-600 hover:to-teal-600 rounded-xl font-medium transition-all cursor-pointer"
              >
                View All Referrals
              </button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
