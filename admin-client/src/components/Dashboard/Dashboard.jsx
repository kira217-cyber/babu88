// src/pages/Dashboard.jsx
import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaUserFriends,
  FaWallet,
  FaHandHoldingUsd,
  FaClock,
  FaMoneyCheckAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import CountUp from "react-countup";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  getDay,
  isSameMonth,
} from "date-fns";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
  }),
};

const CardShell = ({ className = "", children }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={[
      "rounded-2xl shadow-xl border border-yellow-700/30 overflow-hidden",
      className,
    ].join(" ")}
  >
    {children}
  </motion.div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  accent = "from-yellow-600 to-amber-600",
}) => {
  const [prefix, numStr] = value
    .match(/^([^\d]*)(\d+(?:,\d+)*)$/)
    ?.slice(1) || ["", value];
  const num = parseInt(numStr.replace(/,/g, ""), 10) || 0;

  return (
    <CardShell className="bg-gradient-to-br from-black to-yellow-950/40">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-yellow-200 text-sm font-semibold truncate">
              {label}
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white text-2xl font-extrabold mt-1 tracking-tight"
            >
              {prefix}
              <CountUp end={num} duration={2} separator="," />
            </motion.p>
          </div>

          <div
            className={`shrink-0 p-3 rounded-xl bg-gradient-to-br ${accent} shadow-lg shadow-yellow-600/40`}
          >
            <Icon className="text-black text-xl" />
          </div>
        </div>

        <div className="mt-4 h-[1px] bg-yellow-500/20" />
        <p className="mt-3 text-xs text-yellow-300/70">
          Real-time data • updated just now
        </p>
      </div>
    </CardShell>
  );
};

const TinyBarChart = () => {
  const bars = [45, 28, 60, 35, 82, 55, 70];
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      viewBox="0 0 300 120"
      className="w-full h-[120px]"
    >
      {/* grid */}
      <g opacity="0.2" stroke="yellow">
        <line x1="12" y1="25" x2="288" y2="25" />
        <line x1="12" y1="55" x2="288" y2="55" />
        <line x1="12" y1="85" x2="288" y2="85" />
      </g>

      {/* bars */}
      {bars.map((h, i) => {
        const x = 22 + i * 38;
        const y = 105 - h;
        const w = 22;
        const r = 4;
        const isAccent = i === 4;
        return (
          <motion.g
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={r}
              fill={isAccent ? "url(#barGrad)" : "rgba(255,255,255,0.9)"}
              opacity={isAccent ? 1 : 0.92}
            />
          </motion.g>
        );
      })}

      {/* axis labels */}
      <g fill="rgba(255,255,255,0.6)" fontSize="10" fontWeight="700">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <text key={i} x={32 + i * 38} y={116} textAnchor="middle">
            {d}
          </text>
        ))}
      </g>

      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
};

const TinyAreaCard = () => {
  return (
    <motion.svg
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewBox="0 0 360 140"
      className="w-full h-[140px]"
    >
      {/* dark bg wave */}
      <path
        d="M0,55 C40,10 85,10 120,50 C155,90 205,100 250,70 C295,40 330,45 360,60 L360,0 L0,0 Z"
        fill="rgba(255,255,255,0.08)"
      />

      {/* main gradient area */}
      <path
        d="M0,70 C45,10 110,25 150,65 C185,95 235,120 285,85 C315,65 338,65 360,75 L360,140 L0,140 Z"
        fill="url(#areaGrad)"
        opacity="0.97"
      />

      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FACC15" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
};

const EarningsCard = () => (
  <CardShell className="bg-gradient-to-br from-black to-yellow-950/40">
    <div className="p-5">
      <p className="text-yellow-200 text-sm font-semibold">Earnings</p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-3 text-4xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent"
      >
        $
        <CountUp end={911.4} duration={2} decimals={1} />
      </motion.p>
      <p className="mt-2 text-xs text-yellow-300/70">
        Overview of total earnings
      </p>
    </div>
  </CardShell>
);

const Gauge = ({ value = 63 }) => {
  const radius = 84;
  const cx = 110;
  const cy = 110;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const dash = (progress / 100) * circumference;

  return (
    <div className="w-full flex items-center justify-center">
      <motion.svg
        initial={{ opacity: 0, rotate: -10 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 0.8 }}
        width="240"
        height="240"
        viewBox="0 0 220 220"
        className="max-w-full"
      >
        {/* outer ticks */}
        {Array.from({ length: 48 }).map((_, i) => {
          const angle = (i / 48) * 280 - 140;
          const rad = (angle * Math.PI) / 180;
          const r1 = 94;
          const r2 = i % 3 === 0 ? 104 : 100;
          const x1 = 110 + r1 * Math.cos(rad);
          const y1 = 110 + r1 * Math.sin(rad);
          const x2 = 110 + r2 * Math.cos(rad);
          const y2 = 110 + r2 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={
                i * (280 / 48) <= progress * 2.8
                  ? "#F59E0B"
                  : "rgba(255,255,255,0.18)"
              }
              strokeWidth={i % 3 === 0 ? 2.4 : 1.4}
              strokeLinecap="round"
            />
          );
        })}

        {/* track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.78} ${circumference}`}
          strokeDashoffset={circumference * 0.11}
          transform="rotate(140 110 110)"
        />

        {/* progress */}
        <motion.circle
          initial={{ strokeDasharray: 0 }}
          animate={{ strokeDasharray: `${dash * 0.78} ${circumference}` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="url(#gGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDashoffset={circumference * 0.11}
          transform="rotate(140 110 110)"
        />

        {/* center */}
        <circle cx={cx} cy={cy} r="62" fill="rgba(0,0,0,0.35)" />
        <text
          x="110"
          y="110"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="34"
          fontWeight="800"
          fill="#F59E0B"
        >
          {progress}%
        </text>
        <text
          x="110"
          y="140"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="rgba(255,255,255,0.55)"
        >
          PERFORMANCE
        </text>

        <defs>
          <linearGradient id="gGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FACC15" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
};

const RealCalendar = () => {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  // Pad start with empty days
  const startDay = getDay(monthStart);
  const paddedDays = [...Array(startDay).fill(null), ...daysInMonth];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <FaCalendarAlt className="text-yellow-400" />
        <p className="text-yellow-200 text-sm font-semibold">
          {format(now, "MMMM yyyy")}
        </p>
      </div>
      <div className="grid grid-cols-7 gap-2 text-xs font-extrabold text-yellow-300/60">
        {days.map((d) => (
          <div key={d} className="text-center">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2 text-xs font-bold">
        {paddedDays.map((date, i) => {
          if (!date) return <div key={i} className="h-8" />;
          const isCurrent = isToday(date);
          const isThisMonth = isSameMonth(date, now);
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1 }}
              className={[
                "h-8 flex items-center justify-center rounded-lg cursor-pointer",
                isCurrent
                  ? "bg-gradient-to-br from-yellow-600 to-amber-600 text-black shadow-md"
                  : isThisMonth
                    ? "text-yellow-100 hover:bg-yellow-800/40"
                    : "text-yellow-100/35",
              ].join(" ")}
            >
              {format(date, "d")}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const PercentArea = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full"
    >
      <p className="text-3xl font-extrabold text-yellow-400">
        <CountUp end={72.4} duration={2} decimals={1} />%
      </p>
      <div className="mt-2">
        <svg viewBox="0 0 360 140" className="w-full h-[120px]">
          <path
            d="M0,95 C55,30 120,40 160,80 C195,115 240,120 275,85 C305,55 330,60 360,75 L360,140 L0,140 Z"
            fill="url(#pGrad)"
            opacity="0.94"
          />
          <path
            d="M0,95 C55,30 120,40 160,80 C195,115 240,120 275,85 C305,55 330,60 360,75"
            fill="none"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="2.5"
          />
          <defs>
            <linearGradient id="pGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </motion.div>
  );
};

const BottomStrip = () => (
  <CardShell className="bg-gradient-to-br from-black to-yellow-950/40">
    <div className="px-5 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl font-extrabold leading-none"
        >
          <CountUp end={16.4} duration={2} decimals={1} />M{" "}
          <span className="text-xs font-extrabold text-yellow-400 align-middle ml-2">
            +35%
          </span>
        </motion.p>
      </div>

      <div className="h-10 w-[1px] bg-yellow-500/20" />

      <div className="flex-1 text-center min-w-0">
        <p className="text-white text-xl font-extrabold tracking-wide">
          {format(new Date(), "EEEE").toUpperCase()}
        </p>
      </div>

      <div className="h-10 w-[1px] bg-yellow-500/20" />

      <div className="flex items-center gap-3 min-w-0">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-yellow-100 text-sm font-extrabold"
        >
          <CountUp end={14577} duration={2} separator="," />
        </motion.p>
        <svg viewBox="0 0 120 30" className="w-24 h-6">
          <path
            d="M0,18 L10,16 L20,20 L30,10 L40,14 L50,8 L60,12 L70,6 L80,14 L90,11 L100,15 L110,9 L120,12"
            fill="none"
            stroke="url(#sGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="sGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  </CardShell>
);

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Demo stats (can be replaced with real API data)
  const stats = useMemo(
    () => [
      {
        label: "All Users",
        value: "12,540",
        icon: FaUsers,
        accent: "from-yellow-600 to-amber-600",
      },
      {
        label: "All Affiliate Users",
        value: "3,210",
        icon: FaUserFriends,
        accent: "from-amber-600 to-yellow-600",
      },
      {
        label: "All Deposit Balances",
        value: "৳ 8,92,300",
        icon: FaWallet,
        accent: "from-emerald-600 to-teal-600", // kept green for money feel
      },
      {
        label: "All Withdraw Balance",
        value: "৳ 4,21,900",
        icon: FaHandHoldingUsd,
        accent: "from-orange-600 to-amber-600",
      },
      {
        label: "Pending Deposit Requests",
        value: "46",
        icon: FaClock,
        accent: "from-yellow-600 to-amber-500",
      },
      {
        label: "Pending Withdraw Requests",
        value: "19",
        icon: FaMoneyCheckAlt,
        accent: "from-amber-600 to-orange-600",
      },
    ],
    [],
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-gray-100">
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Title with real-time clock */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-7 sm:mb-9 flex flex-col sm:flex-row justify-between items-start sm:items-center"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Dashboard
            </h1>
            <p className="text-sm text-yellow-300 mt-1">
              Real-time Overview • Professional Admin Panel
            </p>
          </div>
          <div className="mt-4 sm:mt-0 text-yellow-200 font-semibold">
            {format(currentTime, "PPPpp")}
          </div>
        </motion.div>

        {/* Top 6 stat cards */}
        <motion.div
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {stats.map((s, i) => (
            <motion.div key={s.label} custom={i} variants={fadeUp}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </motion.div>

        {/* Main widgets layout */}
        <div className="mt-8 sm:mt-10 grid grid-cols-12 gap-5">
          {/* Row 1: bar + area + earnings */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="col-span-12 md:col-span-5"
          >
            <CardShell className="bg-gradient-to-br from-black to-yellow-950/40">
              <div className="p-5">
                <p className="text-yellow-200 text-sm font-semibold">
                  Weekly Activity
                </p>
                <div className="mt-3">
                  <TinyBarChart />
                </div>
              </div>
            </CardShell>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="col-span-12 md:col-span-5"
          >
            <CardShell className="bg-gradient-to-br from-black to-yellow-950/40">
              <div className="p-5">
                <p className="text-yellow-200 text-sm font-semibold">
                  Growth Trend
                </p>
              </div>
              <div className="-mt-2">
                <TinyAreaCard />
              </div>
            </CardShell>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="col-span-12 md:col-span-2"
          >
            <EarningsCard />
          </motion.div>

          {/* Row 2: gauge + calendar + percent */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="col-span-12 lg:col-span-5"
          >
            <CardShell className="bg-gradient-to-br from-black to-yellow-950/40">
              <div className="p-5">
                <p className="text-yellow-200 text-sm font-semibold">
                  Performance Metrics
                </p>
                <div className="mt-2">
                  <Gauge value={63} />
                </div>
                <div className="mt-2 flex items-center justify-end gap-2 text-xs text-yellow-300/70">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-r from-yellow-600 to-amber-600" />
                  <span>Optimal Range</span>
                </div>
              </div>
            </CardShell>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="col-span-12 lg:col-span-4"
          >
            <CardShell className="bg-gradient-to-br from-black to-yellow-950/40">
              <div className="p-5">
                <p className="text-yellow-200 text-sm font-semibold">
                  Calendar
                </p>
                <div className="mt-4">
                  <RealCalendar />
                </div>
              </div>
            </CardShell>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            className="col-span-12 lg:col-span-3"
          >
            <CardShell className="bg-gradient-to-br from-black to-yellow-950/40">
              <div className="p-5">
                <p className="text-yellow-200 text-sm font-semibold">
                  Completion Rate
                </p>
                <div className="mt-3">
                  <PercentArea />
                </div>
              </div>
            </CardShell>
          </motion.div>

          {/* Bottom strip */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={6}
            className="col-span-12"
          >
            <BottomStrip />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
