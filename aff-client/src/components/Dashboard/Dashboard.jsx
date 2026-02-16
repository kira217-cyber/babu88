import React, { useState } from "react";
import {
  FaUsers,
  FaWallet,
  FaChartLine,
  FaLink,
  FaCopy,
  FaEye,
  FaShareAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [copied, setCopied] = useState(false);

  const referralLink = "https://babu88.com/ref/abc123xyz";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!", {
      position: "top-right",
      autoClose: 2000,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  // Sample stats (replace with real data from API/Redux later)
  const stats = [
    {
      title: "Total Referrals",
      value: "248",
      change: "+18%",
      icon: <FaUsers className="text-3xl" />,
      color: "from-cyan-500 to-teal-600",
    },
    {
      title: "Active Referrals",
      value: "137",
      change: "+12%",
      icon: <FaEye className="text-3xl" />,
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Total Commission",
      value: "$4,820",
      change: "+24%",
      icon: <FaWallet className="text-3xl" />,
      color: "from-purple-500 to-indigo-600",
    },
    {
      title: "This Month Earnings",
      value: "$1,240",
      change: "+41%",
      icon: <FaChartLine className="text-3xl" />,
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-cyan-950/10 to-gray-950 text-gray-100 p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Affiliate Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Welcome back! Here's your performance overview
          </p>
        </div>

        {/* Referral Link Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 border border-cyan-800/40 rounded-2xl p-6 mb-8 shadow-xl shadow-cyan-950/30"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                Your Referral Link
              </h3>
              <div className="bg-gray-950 border border-cyan-900/50 rounded-lg px-4 py-3 font-mono text-sm md:text-base break-all">
                {referralLink}
              </div>
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

              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-all duration-300 cursor-pointer">
                <FaShareAlt />
                Share
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-xl shadow-black/40 transform hover:scale-[1.03] transition-transform duration-300`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    {stat.value}
                  </h3>
                </div>
                <div className="text-white/90 opacity-90">{stat.icon}</div>
              </div>
              <p className="mt-4 text-sm">
                <span className="text-emerald-300 font-medium">
                  {stat.change}
                </span>
                <span className="text-white/60 ml-1">vs last month</span>
              </p>
            </motion.div>
          ))}
        </div>

        {/* Analytics / Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/70 border border-cyan-800/30 rounded-2xl p-6 shadow-2xl backdrop-blur-sm"
          >
            <h3 className="text-xl font-bold text-cyan-300 mb-6 flex items-center gap-3">
              <FaChartLine className="text-cyan-400" />
              Earnings Overview
            </h3>

            <div className="h-64 bg-gray-950/50 rounded-xl flex items-center justify-center border border-cyan-900/40">
              <p className="text-gray-400 text-center">
                [ Earnings Chart / Line + Bar Graph ]<br />
                (Integrate Chart.js / Recharts here)
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-400">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-400">$3,950</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-amber-400">$870</p>
              </div>
            </div>
          </motion.div>

          {/* Referrals Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-900/70 border border-cyan-800/30 rounded-2xl p-6 shadow-2xl backdrop-blur-sm"
          >
            <h3 className="text-xl font-bold text-cyan-300 mb-6 flex items-center gap-3">
              <FaUsers className="text-cyan-400" />
              Recent Referrals Activity
            </h3>

            <div className="space-y-4">
              {[
                {
                  name: "playerX789",
                  date: "2 hours ago",
                  commission: "+$45.50",
                },
                {
                  name: "luckywin22",
                  date: "5 hours ago",
                  commission: "+$32.00",
                },
                {
                  name: "betmaster01",
                  date: "Yesterday",
                  commission: "+$78.20",
                },
                {
                  name: "highroller99",
                  date: "2 days ago",
                  commission: "+$120.00",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 px-4 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                  <span className="text-emerald-400 font-medium">
                    {item.commission}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-700 to-teal-700 hover:from-cyan-600 hover:to-teal-600 rounded-xl font-medium transition-all cursor-pointer">
              View All Referrals
            </button>
          </motion.div>
        </div>

        {/* Quick Stats Bar (mobile friendly) */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-900/60 p-4 rounded-xl border border-cyan-900/30">
            <p className="text-sm text-gray-400">Conversion Rate</p>
            <p className="text-xl font-bold text-cyan-300">12.8%</p>
          </div>
          <div className="bg-gray-900/60 p-4 rounded-xl border border-cyan-900/30">
            <p className="text-sm text-gray-400">Avg. Deposit</p>
            <p className="text-xl font-bold text-teal-300">$68.40</p>
          </div>
          <div className="bg-gray-900/60 p-4 rounded-xl border border-cyan-900/30">
            <p className="text-sm text-gray-400">Active Players</p>
            <p className="text-xl font-bold text-purple-300">89</p>
          </div>
          <div className="bg-gray-900/60 p-4 rounded-xl border border-cyan-900/30">
            <p className="text-sm text-gray-400">Top Country</p>
            <p className="text-xl font-bold text-amber-300">BD</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
