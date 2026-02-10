import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router";
import {
  FaHome,
  FaBell,
  FaHeart,
  FaWallet,
  FaChartLine,
  FaSignOutAlt,
  FaSearch,
  FaUsers,
  FaUserCircle,
  FaUpload,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { IoAppsSharp } from "react-icons/io5";
import { GrAnnounce } from "react-icons/gr";
import { FaCodePullRequest } from "react-icons/fa6";
import { PiHandWithdrawBold, PiHandDepositBold } from "react-icons/pi";
import { RxHamburgerMenu } from "react-icons/rx";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { logout } from "../../features/auth/authSlice";
import { useDispatch } from "react-redux";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [promotionsOpen, setPromotionsOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const dispatch = useDispatch();

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

  const menuItems = [
    { to: "/", icon: <FaHome />, text: "Dashboard", end: true },
    { to: "/all-user", icon: <FaUsers />, text: "All Users" },
    { to: "/add-game", icon: <IoAppsSharp />, text: "Add Game" },
    { to: "/add-promotion", icon: <IoAppsSharp />, text: "Promotion Game" },
  ];

  const depositSubItems = [
    { to: "/add-deposit", icon: <FaWallet />, text: "Add Deposit" },
    {
      to: "/deposit-request",
      icon: <FaCodePullRequest />,
      text: "Deposit Request",
    },
  ];

  const withdrawSubItems = [
    { to: "/add-withdraw", icon: <FaWallet />, text: "Add Withdraw" },
    {
      to: "/withdraw-request",
      icon: <FaCodePullRequest />,
      text: "Withdraw Request",
    },
  ];

  const promotionSubItems = [
    { to: "/controller/logos", text: "Logos Controller" },
    { to: "/controller/theme", text: "Theme Controller" },
    { to: "/controller/navbar", text: "Navbar Controller" },
    { to: "/slider-controller", text: "Slider Controller" },
    { to: "/controller/slider2", text: "Slider 2 Controller" },
    { to: "/notice-controller", text: "Notice Controller" },
    { to: "/controller/favivon-icon-title", text: "Favicon And Title" },
    { to: "/banner-video-Controller", text: "Banner Video Controller" },
    { to: "/download-banner-controller", text: "Download Banner Controller" },
    { to: "/controller/payment-method", text: "Payment Method Image" },
    { to: "/controller/social", text: "Social Link Controller" },
    { to: "/controller/bottom-navbar", text: "Bottom Navbar Controller" },
    { to: "/footer-controller", text: "Footer Controller" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-gray-100">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-700 via-purple-700 to-purple-900 px-4 py-3 flex items-center justify-between shadow-lg">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-purple-800/50 transition-colors"
        >
          <RxHamburgerMenu className="text-2xl text-cyan-200" />
        </button>
        <div className="flex items-center gap-5">
          <button className="relative p-1.5">
            <FaBell className="text-xl text-cyan-200 hover:text-white transition-colors" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full ring-2 ring-pink-400/60"></span>
          </button>
          <Link to={"/profile"}>
            {" "}
            <FaUserCircle className="text-2xl text-cyan-200 hover:text-white transition-colors cursor-pointer" />
          </Link>
        </div>
      </div>

      {/* Mobile Overlay */}
      {open && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ x: open || isDesktop ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="fixed md:static top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-indigo-950 via-purple-950/90 to-slate-950 border-r border-purple-800/30 shadow-2xl flex flex-col overflow-hidden"
        >
          <SidebarContent
            menuItems={menuItems}
            depositSubItems={depositSubItems}
            withdrawSubItems={withdrawSubItems}
            promotionSubItems={promotionSubItems}
            promotionsOpen={promotionsOpen}
            setPromotionsOpen={setPromotionsOpen}
            depositOpen={depositOpen}
            setDepositOpen={setDepositOpen}
            withdrawOpen={withdrawOpen}
            setWithdrawOpen={setWithdrawOpen}
            onClose={() => setOpen(false)}
            onLogout={handleLogout}
          />
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Top Bar */}
          <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-6 border-b border-purple-800/40 bg-gradient-to-r from-indigo-900/70 via-purple-900/60 to-slate-900/70 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 text-lg" />
                <input
                  type="text"
                  placeholder="Search games, users, stats..."
                  className="w-full pl-12 pr-5 py-3 bg-slate-800/60 border border-purple-700/50 rounded-xl text-cyan-100 placeholder-purple-300 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button className="relative p-2.5 hover:bg-purple-800/40 rounded-xl transition-colors">
                <FaBell className="text-xl text-cyan-200 hover:text-cyan-100 transition-colors" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pink-500 rounded-full ring-2 ring-pink-400/50"></span>
              </button>
              <Link
                to="/profile"
                className="p-1 hover:bg-purple-800/40 rounded-full transition-colors"
              >
                <FaUserCircle className="text-3xl text-cyan-200 hover:text-cyan-100 transition-colors" />
              </Link>
            </div>
          </div>

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

const SidebarContent = ({
  menuItems,
  depositSubItems,
  withdrawSubItems,
  promotionSubItems,
  promotionsOpen,
  setPromotionsOpen,
  depositOpen,
  setDepositOpen,
  withdrawOpen,
  setWithdrawOpen,
  onClose,
  onLogout,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header / Logo */}
      <div className="p-6 border-b border-purple-800/40 bg-gradient-to-r from-indigo-900/50 to-purple-900/40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
            <span className="text-white font-black text-3xl tracking-wider">
              B
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              BABU88
            </h2>
            <p className="text-sm text-cyan-200/90">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Mobile Close */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-purple-800/40 text-cyan-300 hover:text-cyan-100 md:hidden transition-colors"
        >
          <FaTimes size={24} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto [scrollbar-width:none]">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 rounded-xl mb-1.5 text-base font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-cyan-600/80 to-purple-600/80 text-white shadow-lg shadow-purple-500/30"
                  : "text-cyan-100 hover:bg-purple-900/50 hover:text-white"
              }`
            }
          >
            <span className="text-2xl opacity-90 group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </span>
            <span>{item.text}</span>
          </NavLink>
        ))}

        {/* Deposit Dropdown */}
        <div className="mt-4">
          <button
            onClick={() => setDepositOpen(!depositOpen)}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-cyan-100 hover:bg-purple-900/50 hover:text-white transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">
                <PiHandDepositBold />
              </span>
              <span className="font-medium">Deposit</span>
            </div>
            {depositOpen ? (
              <FaChevronUp size={18} />
            ) : (
              <FaChevronDown size={18} />
            )}
          </button>
          {depositOpen && (
            <div className="mt-2 pl-14 space-y-1">
              {depositSubItems.map((sub) => (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-3 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-cyan-700/50 text-cyan-50 font-medium shadow-sm shadow-purple-500/30"
                        : "text-cyan-200/90 hover:text-white hover:bg-purple-900/60"
                    }`
                  }
                >
                  <span className="text-xl opacity-80">{sub.icon}</span>
                  <span>{sub.text}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Withdraw Dropdown - similar changes */}
        <div className="mt-2">
          <button
            onClick={() => setWithdrawOpen(!withdrawOpen)}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-cyan-100 hover:bg-purple-900/50 hover:text-white transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">
                <PiHandWithdrawBold />
              </span>
              <span className="font-medium">Withdraw</span>
            </div>
            {withdrawOpen ? (
              <FaChevronUp size={18} />
            ) : (
              <FaChevronDown size={18} />
            )}
          </button>
          {withdrawOpen && (
            <div className="mt-2 pl-14 space-y-1">
              {withdrawSubItems.map((sub) => (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-3 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-cyan-700/50 text-cyan-50 font-medium shadow-sm shadow-purple-500/30"
                        : "text-cyan-200/90 hover:text-white hover:bg-purple-900/60"
                    }`
                  }
                >
                  <span className="text-xl opacity-80">{sub.icon}</span>
                  <span>{sub.text}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Client-Site-Controller Dropdown */}
        <div className="mt-4">
          <button
            onClick={() => setPromotionsOpen(!promotionsOpen)}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-cyan-100 hover:bg-purple-900/50 hover:text-white transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">
                <GrAnnounce />
              </span>
              <span className="font-medium">Client Site Controller</span>
            </div>
            {promotionsOpen ? (
              <FaChevronUp size={18} />
            ) : (
              <FaChevronDown size={18} />
            )}
          </button>
          {promotionsOpen && (
            <div className="mt-2 pl-14 space-y-1">
              {promotionSubItems.map((sub) => (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block px-5 py-3 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-cyan-700/50 text-cyan-50 font-medium shadow-sm shadow-purple-500/30"
                        : "text-cyan-200/90 hover:text-white hover:bg-purple-900/60"
                    }`
                  }
                >
                  {sub.text}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-5 border-t border-purple-800/40 mt-auto shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex cursor-pointer items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-purple-500/40 border border-purple-500/30"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
