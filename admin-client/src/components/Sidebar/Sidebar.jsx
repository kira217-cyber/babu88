import React, { useState, useEffect, useMemo } from "react";
import { Link, NavLink, Outlet } from "react-router";
import {
  FaHome,
  FaBell,
  FaWallet,
  FaSignOutAlt,
  FaSearch,
  FaUsers,
  FaUserCircle,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { IoAppsSharp } from "react-icons/io5";
import { GrAnnounce, GrUserAdmin } from "react-icons/gr";
import { FaCodePullRequest } from "react-icons/fa6";
import { PiHandWithdrawBold, PiHandDepositBold } from "react-icons/pi";
import { RxHamburgerMenu } from "react-icons/rx";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { logout } from "../../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth } from "../../features/auth/authSelectors";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [promotionsOpen, setPromotionsOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);

  const role = auth?.admin?.role; // "mother" | "sub"
  const permissions = auth?.admin?.permissions || [];

  const isMother = role === "mother";
  const can = (key) => isMother || permissions.includes(key);

  const canAny = (keys) =>
    isMother || keys.some((k) => permissions.includes(k));

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

  // ✅ Base menus with permission keys
  const menuItems = useMemo(
    () => [
      {
        key: "dashboard",
        to: "/",
        icon: <FaHome />,
        text: "Dashboard",
        end: true,
      },
      {
        key: "all-user",
        to: "/all-user",
        icon: <FaUsers />,
        text: "All Users",
      },
      {
        key: "add-game",
        to: "/add-game",
        icon: <IoAppsSharp />,
        text: "Add Game",
      },
      {
        key: "add-promotion",
        to: "/add-promotion",
        icon: <IoAppsSharp />,
        text: "Add Promotion",
      },

      // ✅ only mother
      {
        key: "__mother__",
        to: "/create-admin",
        icon: <GrUserAdmin />,
        text: "Create Admin",
      },
    ],
    [],
  );

  // ✅ Deposit submenu with per-item permission keys
  const depositSubItems = useMemo(
    () => [
      {
        perm: "add-deposit",
        to: "/add-deposit",
        icon: <FaWallet />,
        text: "Add Deposit",
      },
      {
        perm: "deposit-request",
        to: "/deposit-request",
        icon: <FaCodePullRequest />,
        text: "Deposit Request",
      },
    ],
    [],
  );

  // ✅ Withdraw submenu with per-item permission keys
  const withdrawSubItems = useMemo(
    () => [
      {
        perm: "add-withdraw",
        to: "/add-withdraw",
        icon: <FaWallet />,
        text: "Add Withdraw",
      },
      {
        perm: "withdraw-request",
        to: "/withdraw-request",
        icon: <FaCodePullRequest />,
        text: "Withdraw Request",
      },
    ],
    [],
  );

  // ✅ Controller submenu with per-item permission keys
  const promotionSubItems = useMemo(
    () => [
      {
        perm: "fav-icon-and-logo-controller",
        to: "/fav-icon-and-logo-controller",
        text: "Favicon Logo Controller",
      },
      {
        perm: "download-header-controller",
        to: "/download-header-controller",
        text: "Download Header Controller",
      },
      {
        perm: "slider-controller",
        to: "/slider-controller",
        text: "Slider Controller",
      },
      {
        perm: "notice-controller",
        to: "/notice-controller",
        text: "Notice Controller",
      },
      {
        perm: "two-banner-controller",
        to: "/two-banner-controller",
        text: "Two Banner Controller",
      },
      {
        perm: "single-banner-controller",
        to: "/single-banner-controller",
        text: "Single Banner Controller",
      },
      {
        perm: "download-banner-controller",
        to: "/download-banner-controller",
        text: "Download Banner Controller",
      },
      {
        perm: "banner-video-controller",
        to: "/banner-video-controller",
        text: "Banner Video Controller",
      },
      {
        perm: "floating-social-controller",
        to: "/floating-social-controller",
        text: "Social Link Controller",
      },
      {
        perm: "footer-controller",
        to: "/footer-controller",
        text: "Footer Controller",
      },
    ],
    [],
  );

  // ✅ Visible top menu items
  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((m) => {
      if (m.key === "__mother__") return isMother;
      return can(m.key);
    });
  }, [menuItems, isMother, permissions]); // eslint-disable-line

  // ✅ Filter dropdown items by permission
  const visibleDepositSubItems = useMemo(
    () => depositSubItems.filter((s) => can(s.perm)),
    [depositSubItems, permissions, isMother], // eslint-disable-line
  );

  const visibleWithdrawSubItems = useMemo(
    () => withdrawSubItems.filter((s) => can(s.perm)),
    [withdrawSubItems, permissions, isMother], // eslint-disable-line
  );

  const visibleControllerSubItems = useMemo(
    () => promotionSubItems.filter((s) => can(s.perm)),
    [promotionSubItems, permissions, isMother], // eslint-disable-line
  );

  // ✅ Dropdown show হবে যদি ভিতরে অন্তত ১টা item visible থাকে
  const showDeposit = visibleDepositSubItems.length > 0;
  const showWithdraw = visibleWithdrawSubItems.length > 0;
  const showController = visibleControllerSubItems.length > 0;

  // ✅ auto close dropdowns if not allowed
  useEffect(() => {
    if (!showDeposit) setDepositOpen(false);
    if (!showWithdraw) setWithdrawOpen(false);
    if (!showController) setPromotionsOpen(false);
  }, [showDeposit, showWithdraw, showController]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-black via-yellow-950/20 to-black text-white">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-500 px-4 py-3 flex items-center justify-between shadow-lg shadow-yellow-900/30">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-yellow-700/60 transition-colors"
        >
          <RxHamburgerMenu className="text-2xl text-white" />
        </button>
        <div className="flex items-center gap-5">
          <button className="relative p-1.5">
            <FaBell className="text-xl text-white hover:text-yellow-200 transition-colors" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-400/70"></span>
          </button>
          <Link to="/profile">
            <FaUserCircle className="text-2xl text-white hover:text-yellow-200 transition-colors cursor-pointer" />
          </Link>
        </div>
      </div>

      {/* Mobile Overlay */}
      {open && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ x: open || isDesktop ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="fixed md:static top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-black via-yellow-950/30 to-black border-r border-yellow-700/40 shadow-2xl flex flex-col overflow-hidden"
        >
          <SidebarContent
            menuItems={visibleMenuItems}
            depositSubItems={visibleDepositSubItems}
            withdrawSubItems={visibleWithdrawSubItems}
            promotionSubItems={visibleControllerSubItems}
            promotionsOpen={promotionsOpen}
            setPromotionsOpen={setPromotionsOpen}
            depositOpen={depositOpen}
            setDepositOpen={setDepositOpen}
            withdrawOpen={withdrawOpen}
            setWithdrawOpen={setWithdrawOpen}
            showDeposit={showDeposit}
            showWithdraw={showWithdraw}
            showController={showController}
            onClose={() => setOpen(false)}
            onLogout={handleLogout}
            role={role}
          />
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Top Bar */}
          <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-6 border-b border-yellow-700/40 bg-gradient-to-r from-black/90 via-yellow-950/40 to-black/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search games, users, stats..."
                  className="w-full pl-12 pr-5 py-3 bg-black/70 border border-yellow-700/50 rounded-xl text-white placeholder-yellow-400/70 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button className="relative p-2.5 hover:bg-yellow-800/40 rounded-xl transition-colors">
                <FaBell className="text-xl text-yellow-300 hover:text-white transition-colors" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-400/60"></span>
              </button>
              <Link
                to="/profile"
                className="p-1 hover:bg-yellow-800/40 rounded-full transition-colors"
              >
                <FaUserCircle className="text-3xl text-yellow-300 hover:text-white transition-colors" />
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
  showDeposit,
  showWithdraw,
  showController,
  onClose,
  onLogout,
  role,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header / Logo */}
      <div className="p-6 border-b border-yellow-700/40 bg-gradient-to-r from-black/70 to-yellow-950/20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
            <span className="text-black font-black text-3xl tracking-wider">
              B
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              BABU88
            </h2>
            <p className="text-sm text-yellow-200/90 font-medium">
              {role === "mother" ? "Mother" : "Sub"} Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Close */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-yellow-800/50 text-white hover:text-yellow-200 md:hidden transition-colors"
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
                  ? "bg-gradient-to-r from-yellow-500/90 to-amber-500/90 text-black shadow-lg shadow-yellow-600/50"
                  : "text-white hover:bg-yellow-900/40 hover:text-yellow-100"
              }`
            }
          >
            <span className="text-2xl opacity-90 group-hover:scale-110 transition-transform duration-200 text-white">
              {item.icon}
            </span>
            <span>{item.text}</span>
          </NavLink>
        ))}

        {/* Deposit Dropdown */}
        {showDeposit && (
          <div className="mt-4">
            <button
              onClick={() => setDepositOpen(!depositOpen)}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-white hover:bg-yellow-900/40 hover:text-yellow-100 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl text-white">
                  <PiHandDepositBold />
                </span>
                <span className="font-medium">Deposit</span>
              </div>
              {depositOpen ? (
                <FaChevronUp size={18} className="text-white" />
              ) : (
                <FaChevronDown size={18} className="text-white" />
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
                          ? "bg-yellow-600/80 text-black font-medium shadow-sm shadow-yellow-500/40"
                          : "text-yellow-100 hover:text-white hover:bg-yellow-800/50"
                      }`
                    }
                  >
                    <span className="text-xl opacity-90 text-white">
                      {sub.icon}
                    </span>
                    <span>{sub.text}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Withdraw Dropdown */}
        {showWithdraw && (
          <div className="mt-2">
            <button
              onClick={() => setWithdrawOpen(!withdrawOpen)}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-white hover:bg-yellow-900/40 hover:text-yellow-100 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl text-white">
                  <PiHandWithdrawBold />
                </span>
                <span className="font-medium">Withdraw</span>
              </div>
              {withdrawOpen ? (
                <FaChevronUp size={18} className="text-white" />
              ) : (
                <FaChevronDown size={18} className="text-white" />
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
                          ? "bg-yellow-600/80 text-black font-medium shadow-sm shadow-yellow-500/40"
                          : "text-yellow-100 hover:text-white hover:bg-yellow-800/50"
                      }`
                    }
                  >
                    <span className="text-xl opacity-90 text-white">
                      {sub.icon}
                    </span>
                    <span>{sub.text}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Client Site Controller Dropdown */}
        {showController && (
          <div className="mt-4">
            <button
              onClick={() => setPromotionsOpen(!promotionsOpen)}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-white hover:bg-yellow-900/40 hover:text-yellow-100 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl text-white">
                  <GrAnnounce />
                </span>
                <span className="font-medium">Client Site Controller</span>
              </div>
              {promotionsOpen ? (
                <FaChevronUp size={18} className="text-white" />
              ) : (
                <FaChevronDown size={18} className="text-white" />
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
                          ? "bg-yellow-600/80 text-black font-medium shadow-sm shadow-yellow-500/40"
                          : "text-yellow-100 hover:text-white hover:bg-yellow-800/50"
                      }`
                    }
                  >
                    {sub.text}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-5 border-t border-yellow-700/40 mt-auto shrink-0">
        <button
          onClick={onLogout}
          className="w-full cursor-pointer flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 rounded-xl text-black font-medium transition-all duration-300 shadow-lg shadow-yellow-600/50 border border-yellow-400/40"
        >
          <FaSignOutAlt className="text-black" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
