import React, { useState, useEffect, useCallback, useMemo } from "react";
import { NavLink, Link, Outlet } from "react-router";
import {
  FaHome,
  FaUsers,
  FaWallet,
  FaChartLine,
  FaBullhorn,
  FaCog,
  FaLink,
  FaImage,
  FaSignOutAlt,
  FaUserCircle,
  FaBell,
  FaTimes,
} from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";

// ✅ NEW: same as Navbar
import { TfiReload } from "react-icons/tfi";
import { api } from "../../api/axios";
import { selectAuth } from "../../features/auth/authSelectors";

// ✅ balance fetch (direct API)
const fetchMyBalance = async (token) => {
  const { data } = await api.get("/api/users/aff/me/balance", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data; // { balance, currency }
};

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const dispatch = useDispatch();

  // ✅ NEW: auth token (don't change other functionality)
  const auth = useSelector(selectAuth);
  const token = auth?.token;

  // ✅ NEW: balance state (like Navbar)
  const [balanceState, setBalanceState] = useState(0);
  const [currencyState, setCurrencyState] = useState("BDT");
  const [balReloading, setBalReloading] = useState(false);

  const currencySymbol = useMemo(() => {
    return currencyState === "USDT" ? "$" : "৳";
  }, [currencyState]);

  // ✅ initial balance fetch when token available
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!token) return;
      try {
        const d = await fetchMyBalance(token);
        if (!mounted) return;
        const b = Number(d?.balance) || 0;
        const c = d?.currency || "BDT";
        setBalanceState(b);
        setCurrencyState(c);
      } catch {
        // silent (same behavior as navbar)
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [token]);

  // ✅ reload balance
  const reloadBalance = useCallback(async () => {
    if (!token) return;
    try {
      setBalReloading(true);
      const d = await fetchMyBalance(token);
      const b = Number(d?.balance) || 0;
      const c = d?.currency || "BDT";
      setBalanceState(b);
      setCurrencyState(c);
    } catch (e) {
      toast.error("Balance refresh failed", { autoClose: 1800 });
    } finally {
      setBalReloading(false);
    }
  }, [token]);

  useEffect(() => {
    const handleResize = () => {
      const nowDesktop = window.innerWidth >= 768;
      setIsDesktop(nowDesktop);
      if (nowDesktop) setOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const menuItems = [
    { to: "/dashboard", icon: <FaHome />, text: "Dashboard", end: true },
    { to: "/dashboard/my-refer", icon: <FaUsers />, text: "My Referrals" },
    { to: "/dashboard/commissions", icon: <FaWallet />, text: "Commissions" },
    { to: "/dashboard/withdraw", icon: <FaChartLine />, text: "Withdraw" },
    {
      to: "/dashboard/withdraw-history",
      icon: <FaBullhorn />,
      text: "Withdraw-History",
    },
  ];

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-gray-950 via-cyan-950/20 to-gray-950 text-gray-100">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-700 px-4 py-3 flex items-center justify-between shadow-lg shadow-cyan-900/50">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-cyan-800/70 transition-colors cursor-pointer"
        >
          <RxHamburgerMenu className="text-2xl text-white" />
        </button>

        <div className="flex items-center gap-5">
          {/* (mobile) unchanged */}
          {/* ✅ UPDATED: Balance pill (replaces bell button) */}
          <div className="h-11 rounded-xl bg-gray-900/60 border border-cyan-700/50 px-4 flex items-center gap-3 shadow-sm">
            <div className="text-[12px] font-extrabold text-cyan-200/90">
              Balance
            </div>
            <div className="text-[15px] font-extrabold text-white tabular-nums">
              {currencySymbol} {Number(balanceState).toFixed(2)}
            </div>

            <button
              type="button"
              onClick={reloadBalance}
              disabled={balReloading || !token}
              className="ml-1 inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-cyan-900/40 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              title="Reload balance"
              aria-label="Reload balance"
            >
              <span className={balReloading ? "animate-spin" : ""}>
                <TfiReload className="text-cyan-200" />
              </span>
            </button>
          </div>
          <Link to="/dashboard/profile" className="cursor-pointer">
            <FaUserCircle className="text-2xl text-white hover:text-cyan-200 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Mobile Overlay */}
      {open && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ x: open || isDesktop ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="fixed md:static top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-gray-950 via-cyan-950/30 to-gray-950 border-r border-cyan-800/50 shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="flex flex-col h-full">
            {/* Header / Logo */}
            <div className="p-6 border-b border-cyan-800/50 bg-gradient-to-r from-gray-900/80 to-cyan-950/30 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-600/60">
                  <span className="text-black font-black text-3xl tracking-wider">
                    A
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Affiliate Panel
                  </h2>
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            {open && (
              <button
                onClick={() => setOpen(false)}
                className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-cyan-900/60 text-white hover:text-cyan-200 md:hidden transition-colors cursor-pointer"
              >
                <FaTimes size={24} />
              </button>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 overflow-y-auto scrollbar-hide">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3.5 rounded-xl mb-1.5 text-base font-medium transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-600/90 to-teal-600/90 text-white shadow-lg shadow-cyan-700/60 font-semibold"
                        : "text-cyan-100 hover:bg-cyan-900/40 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`text-2xl transition-transform duration-200 ${
                          isActive
                            ? "scale-110 text-white"
                            : "opacity-90 group-hover:scale-110"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.text}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-5 border-t border-cyan-800/50 mt-auto shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-cyan-700/50 border border-cyan-500/50 cursor-pointer"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content + Topbar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Top Bar */}
          <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-6 border-b border-cyan-800/50 bg-gradient-to-r from-gray-950/90 via-cyan-950/30 to-gray-950/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <FaHome className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 text-lg pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search referrals, stats..."
                  className="w-full pl-12 pr-5 py-3 bg-gray-900/70 border border-cyan-700/50 rounded-xl text-white placeholder-cyan-400/70 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* ✅ UPDATED: Balance pill (replaces bell button) */}
              <div className="h-11 rounded-xl bg-gray-900/60 border border-cyan-700/50 px-4 flex items-center gap-3 shadow-sm">
                <div className="text-[12px] font-extrabold text-cyan-200/90">
                  Balance
                </div>
                <div className="text-[15px] font-extrabold text-white tabular-nums">
                  {currencySymbol} {Number(balanceState).toFixed(2)}
                </div>

                <button
                  type="button"
                  onClick={reloadBalance}
                  disabled={balReloading || !token}
                  className="ml-1 inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-cyan-900/40 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Reload balance"
                  aria-label="Reload balance"
                >
                  <span className={balReloading ? "animate-spin" : ""}>
                    <TfiReload className="text-cyan-200" />
                  </span>
                </button>
              </div>

              {/* Profile Icon (unchanged) */}
              <Link
                to="/dashboard/profile"
                className="p-1 hover:bg-cyan-900/50 rounded-full transition-colors cursor-pointer"
              >
                <FaUserCircle className="text-3xl text-cyan-300 hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto [scrollbar-width:none]">
            <div className="h-full">
              <div className="mt-16 md:mt-0 p-4 lg:p-6">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
