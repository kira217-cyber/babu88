import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaChevronDown,
  FaTimes,
  FaGlobe,
  FaQuestionCircle,
  FaHeadset,
  FaDownload,
  FaUserAlt,
  FaBell,
  FaPlus,
  FaSignOutAlt,
} from "react-icons/fa";
import {
  FaTag,
  FaGift,
  FaUsers,
  FaChartBar,
  FaCrown,
  FaGamepad,
  FaDice,
  FaRocket,
  FaBaseballBall,
  FaTable,
  FaBolt,
  FaFish,
  FaFutbol,
} from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";

// ✅ redux
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import {
  selectAuth,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";
import { api } from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

const fetchBranding = async () => {
  const { data } = await api.get("/api/site-branding");
  return data;
};

const fetchNavbarColor = async () => {
  const { data } = await api.get("/api/navbar-color");
  return data;
};

// Tiny Flag components (unchanged)
const BdFlag = ({ className = "" }) => (
  <span
    className={`relative inline-block rounded-full bg-[#006a4e] ${className}`}
    aria-hidden="true"
  >
    <span className="absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f42a41]" />
  </span>
);

const EnFlag = ({ className = "" }) => (
  <span
    className={`relative inline-block rounded-full bg-[#012169] ${className}`}
    aria-hidden="true"
  >
    <span className="absolute inset-0 rounded-full opacity-90" />
    <span className="absolute left-1/2 top-0 h-full w-[28%] -translate-x-1/2 bg-white/95" />
    <span className="absolute top-1/2 left-0 w-full h-[28%] -translate-y-1/2 bg-white/95" />
    <span className="absolute left-1/2 top-0 h-full w-[16%] -translate-x-1/2 bg-[#C8102E]" />
    <span className="absolute top-1/2 left-0 w-full h-[16%] -translate-y-1/2 bg-[#C8102E]" />
  </span>
);

const Badge = ({ variant = "hot", children }) => {
  const cls =
    variant === "new" ? "bg-[#18b84a] text-white" : "bg-[#ff3b30] text-white";
  return (
    <span
      className={`ml-auto inline-flex items-center justify-center px-2 py-[2px] rounded-full text-[10px] font-extrabold ${cls}`}
    >
      {children}
    </span>
  );
};

// ✅ NavItem updated: design same, only color/text-size dynamic
const NavItem = ({ to, icon: Icon, label, badge, onClick, colors }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition font-semibold"
      style={({ isActive }) => ({
        backgroundColor: isActive
          ? colors.sidebarActiveBg
          : colors.sidebarLinkBg,
        color: isActive ? colors.sidebarActiveText : colors.sidebarLinkText,
        fontSize: `${colors.sidebarLinkTextSize}px`,
      })}
    >
      <span className="w-10 h-10 rounded-lg flex items-center justify-center">
        {/* icon follows text color via currentColor */}
        <Icon
          className="text-2xl"
          style={{ color: "currentColor", opacity: 0.9 }}
        />
      </span>
      <span className="truncate">{label}</span>
      {badge?.type ? <Badge variant={badge.type}>{badge.text}</Badge> : null}
    </NavLink>
  );
};

const Navber = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isBangla, language, changeLanguage } = useLanguage();

  const { data } = useQuery({
    queryKey: ["site-branding"],
    queryFn: fetchBranding,
    staleTime: 1000 * 60 * 10,
  });

  // ✅ navbar color config from DB
  const { data: navColor } = useQuery({
    queryKey: ["navbar-color"],
    queryFn: fetchNavbarColor,
    staleTime: 1000 * 60 * 10,
  });

  // ✅ fallback (hardcoded values) -> design unchanged
  const colors = useMemo(() => {
    return {
      loginBg: navColor?.loginBg || "#f5b400",
      loginText: navColor?.loginText || "#000000",
      loginTextSize: navColor?.loginTextSize ?? 14,

      registerBg: navColor?.registerBg || "#0b78f0",
      registerText: navColor?.registerText || "#ffffff",
      registerTextSize: navColor?.registerTextSize ?? 14,

      iconBg: navColor?.iconBg || "#f5b400",
      iconText: navColor?.iconText || "#000000",

      sidebarLinkBg: navColor?.sidebarLinkBg || "#ffffff",
      sidebarLinkText: navColor?.sidebarLinkText || "#000000",
      sidebarLinkTextSize: navColor?.sidebarLinkTextSize ?? 14,

      sidebarActiveBg: navColor?.sidebarActiveBg || "#f5b400",
      sidebarActiveText: navColor?.sidebarActiveText || "#000000",
    };
  }, [navColor]);

  // ✅ redux auth
  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const user = auth?.user;
  const username = user?.username || user?.name || "User";
  const notifCount = user?.notificationsCount ?? 0;
  const balance = Number(user?.balance ?? 0);

  const view = useMemo(() => {
    const title = isBangla ? data?.titleBn : data?.titleEn;
    const faviconUrl = data?.faviconUrl
      ? `${api.defaults.baseURL}${data.faviconUrl}`
      : "";
    const logoUrl = data?.logoUrl
      ? `${api.defaults.baseURL}${data.logoUrl}`
      : "";
    const isActive = data?.isActive ?? true;

    return { title: title || "", faviconUrl, logoUrl, isActive };
  }, [data, isBangla]);

  const t = useMemo(
    () => ({
      login: isBangla ? "লগইন করুন" : "Login",
      join: isBangla ? "এখনি যোগদিন" : "Join Now",
      language: isBangla ? "ভাষা" : "Language",

      gamesSection: isBangla ? "Games" : "Games",
      othersSection: isBangla ? "Others" : "Others",

      promotions: isBangla ? "প্রমোশন" : "Promotions",
      rewards: isBangla ? "পুরস্কার" : "Rewards",
      referral: isBangla ? "রেফারেল প্রোগ্রাম" : "Referral Program",
      bettingPass: isBangla ? "বেটিং পাস" : "Betting Pass",
      affiliates: isBangla ? "অ্যাফিলিয়েট" : "Affiliate",
      vip: isBangla ? "বেটিং: ভিআইপি" : "Betting: VIP",

      slot: isBangla ? "স্লট গেম" : "Slot",
      casino: isBangla ? "ক্যাসিনো" : "Casino",
      crash: isBangla ? "ক্র্যাশ" : "Crash",
      cricket: isBangla ? "ক্রিকেট" : "Cricket",
      tableGames: isBangla ? "টেবিল গেম" : "Table Games",
      fast: isBangla ? "ফাস্ট" : "Fast",
      fish: isBangla ? "মাছ ধরা" : "Fish",
      sportsBook: isBangla ? "খেলার বই" : "Sportsbook",

      faq: isBangla ? "FAQ / সাহায্য" : "FAQ / Help",
      liveChat: isBangla ? "লাইভ চ্যাট" : "Live Chat",
      download: isBangla ? "ডাউনলোড করুন" : "Download App",
    }),
    [isBangla],
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!langRef.current?.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setLangOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [sidebarOpen]);

  const currentFlag =
    language === "Bangla" ? (
      <BdFlag className="h-7 w-7" />
    ) : (
      <EnFlag className="h-7 w-7" />
    );

  const onSelectLang = (lang) => {
    changeLanguage(lang);
    setLangOpen(false);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    setSidebarOpen(false);
    setLangOpen(false);
    navigate("/");
  };

  const promoItems = [
    { to: "/promotions", icon: FaTag, label: t.promotions },
    {
      to: "/rewards",
      icon: FaGift,
      label: t.rewards,
      badge: { type: "new", text: "new" },
    },
    {
      to: "/referral",
      icon: FaUsers,
      label: t.referral,
      badge: { type: "hot", text: "HOT" },
    },
    {
      to: "/betting-pass",
      icon: FaChartBar,
      label: t.bettingPass,
      badge: { type: "hot", text: "HOT" },
    },
    { to: "/affiliate", icon: FaRocket, label: t.affiliates },
    {
      to: "/vip",
      icon: FaCrown,
      label: t.vip,
      badge: { type: "hot", text: "HOT" },
    },
  ];

  const gameItems = [
    { to: "/games/slot", icon: FaGamepad, label: t.slot },
    { to: "/games/casino", icon: FaDice, label: t.casino },
    { to: "/games/crash", icon: FaRocket, label: t.crash },
    { to: "/games/cricket", icon: FaBaseballBall, label: t.cricket },
    { to: "/games/table", icon: FaTable, label: t.tableGames },
    {
      to: "/games/fast",
      icon: FaBolt,
      label: t.fast,
      badge: { type: "new", text: "new" },
    },
    { to: "/games/fish", icon: FaFish, label: t.fish },
    { to: "/sportsbook", icon: FaFutbol, label: t.sportsBook },
  ];

  const otherItems = [
    { icon: FaQuestionCircle, label: t.faq, to: "/faq" },
    { icon: FaHeadset, label: t.liveChat, to: "/live-chat" },
    { icon: FaDownload, label: t.download, to: "/download" },
  ];

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: {
      x: 0,
      transition: { type: "spring", damping: 22, stiffness: 180 },
    },
    exit: {
      x: "-100%",
      transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="w-full bg-white border-t-2 border-black/70 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="mx-auto px-3 sm:px-4">
          <div className="h-[72px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-black/10 hover:bg-black/5 active:scale-[0.98] transition"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <FaBars className="text-black/80" />
              </button>

              {/* logo */}
              <Link to="/" className="flex items-center gap-2 select-none">
                {view.logoUrl ? (
                  <img
                    src={view.logoUrl}
                    alt="Site Logo"
                    className="w-38 h-12 md:w-40 md:h-14 lg:w-64 lg:h-16"
                    loading="lazy"
                    draggable={false}
                  />
                ) : (
                  <div className="h-10 px-3 rounded-lg bg-black/5 flex items-center text-black/60 font-bold">
                    No Logo
                  </div>
                )}
              </Link>
            </div>

            {/* ✅ RIGHT SIDE: Logged out vs Logged in */}
            <div className="flex items-center gap-2 md:gap-8">
              {!isAuthenticated ? (
                <>
                  {/* ✅ login btn: only colors/text-size from DB */}
                  <Link
                    to="/login"
                    style={{
                      backgroundColor: colors.loginBg,
                      color: colors.loginText,
                      fontSize: `${colors.loginTextSize}px`,
                    }}
                    className="hidden sm:inline-flex items-center justify-center h-10 px-4 rounded-lg font-extrabold text-sm shadow-sm hover:brightness-95 active:scale-[0.99] transition"
                  >
                    {t.login}
                  </Link>

                  {/* ✅ register btn */}
                  <Link
                    to="/register"
                    style={{
                      backgroundColor: colors.registerBg,
                      color: colors.registerText,
                      fontSize: `${colors.registerTextSize}px`,
                    }}
                    className="hidden sm:inline-flex items-center justify-center h-10 px-4 rounded-lg font-extrabold text-sm shadow-sm hover:brightness-95 active:scale-[0.99] transition"
                  >
                    {t.join}
                  </Link>

                  {/* language */}
                  <div className="relative z-[70]" ref={langRef}>
                    <button
                      type="button"
                      onClick={() => setLangOpen((v) => !v)}
                      className="h-10 px-3 rounded-full bg-[#d9d9d9] flex items-center gap-2 border border-black/10 hover:brightness-95 active:scale-[0.99] transition"
                      aria-haspopup="menu"
                      aria-expanded={langOpen}
                    >
                      {currentFlag}
                      <FaChevronDown className="text-black/70 text-sm" />
                    </button>

                    {langOpen && (
                      <div
                        className="absolute right-0 mt-2 w-[180px] rounded-xl border border-black/10 bg-white shadow-lg overflow-hidden"
                        role="menu"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectLang("Bangla")}
                          className={`w-full px-3 py-2.5 flex items-center gap-2 text-sm font-semibold hover:bg-black/5 ${
                            language === "Bangla" ? "bg-black/5" : ""
                          }`}
                        >
                          <BdFlag className="h-6 w-6" />
                          বাংলা
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectLang("English")}
                          className={`w-full px-3 py-2.5 flex items-center gap-2 text-sm font-semibold hover:bg-black/5 ${
                            language === "English" ? "bg-black/5" : ""
                          }`}
                        >
                          <EnFlag className="h-6 w-6" />
                          English
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* ✅ Screenshot-like logged in bar */}
                  <div className="flex items-center gap-3">
                    {/* username */}
                    <span className="hidden sm:inline text-[14px] font-semibold text-black">
                      {username}
                    </span>

                    {/* ✅ profile (bg/icon color from DB) */}
                    <Link
                      to="/profile"
                      style={{ backgroundColor: colors.iconBg }}
                      className="h-10 w-10 rounded-full flex items-center justify-center shadow-sm hover:brightness-95 active:scale-[0.99] transition"
                      aria-label="Profile"
                      title="Profile"
                    >
                      <FaUserAlt
                        style={{ color: colors.iconText }}
                        className="text-[16px]"
                      />
                    </Link>

                    {/* ✅ notification (bg/icon color from DB) */}
                    <Link
                      to="/notifications"
                      style={{ backgroundColor: colors.iconBg }}
                      className="relative h-10 w-10 rounded-full flex items-center justify-center shadow-sm hover:brightness-95 active:scale-[0.99] transition"
                      aria-label="Notifications"
                      title="Notifications"
                    >
                      <FaBell
                        style={{ color: colors.iconText }}
                        className="text-[16px]"
                      />
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0b78f0] text-white text-[11px] font-extrabold flex items-center justify-center">
                        {notifCount}
                      </span>
                    </Link>

                    {/* divider */}
                    <span className="hidden sm:block w-px h-8 bg-black/20" />

                    {/* balance pill */}
                    <div className="hidden h-10 rounded-full bg-[#e6e6e6] md:flex items-center px-4 font-extrabold text-black text-[14px] shadow-sm">
                      ৳ {balance.toFixed(2)}
                    </div>

                    {/* add balance blue circle */}
                    <Link
                      to="/deposit"
                      className="hidden h-10 w-10 rounded-full bg-[#0b78f0] text-white md:flex items-center justify-center shadow-sm hover:brightness-95 active:scale-[0.99] transition"
                      aria-label="Add balance"
                      title="Add balance"
                    >
                      <FaPlus />
                    </Link>

                    {/* divider */}
                    <span className="hidden sm:block w-px h-8 bg-black/20" />

                    {/* language (keep same) */}
                    <div
                      className="hidden md:block relative z-[70]"
                      ref={langRef}
                    >
                      <button
                        type="button"
                        onClick={() => setLangOpen((v) => !v)}
                        className="h-10 px-3 rounded-full bg-[#d9d9d9] flex items-center gap-2 border border-black/10 hover:brightness-95 active:scale-[0.99] transition"
                        aria-haspopup="menu"
                        aria-expanded={langOpen}
                      >
                        {currentFlag}
                        <FaChevronDown className="text-black/70 text-sm" />
                      </button>

                      {langOpen && (
                        <div
                          className="absolute right-0 mt-2 w-[180px] rounded-xl border border-black/10 bg-white shadow-lg overflow-hidden"
                          role="menu"
                        >
                          <button
                            type="button"
                            onClick={() => onSelectLang("Bangla")}
                            className={`w-full px-3 py-2.5 flex items-center gap-2 text-sm font-semibold hover:bg-black/5 ${
                              language === "Bangla" ? "bg-black/5" : ""
                            }`}
                          >
                            <BdFlag className="h-6 w-6" />
                            বাংলা
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectLang("English")}
                            className={`w-full px-3 py-2.5 flex items-center gap-2 text-sm font-semibold hover:bg-black/5 ${
                              language === "English" ? "bg-black/5" : ""
                            }`}
                          >
                            <EnFlag className="h-6 w-6" />
                            English
                          </button>
                        </div>
                      )}
                    </div>

                    {/* logout icon */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="h-10 w-10 rounded-md bg-black/5 flex items-center justify-center hover:bg-black/10 active:scale-[0.99] transition"
                      aria-label="Logout"
                      title="Logout"
                    >
                      <FaSignOutAlt className="text-black/80" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar (same as before) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/40 z-[70] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 h-full w-[82%] max-w-[320px] bg-white z-[71] shadow-2xl lg:hidden"
            >
              <div className="px-4 pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 select-none">
                    {/* logo */}
                    <Link
                      to="/"
                      className="flex items-center gap-2 select-none"
                    >
                      {view.logoUrl ? (
                        <img
                          src={view.logoUrl}
                          alt="Site Logo"
                          className="w-48 h-14"
                          loading="lazy"
                          draggable={false}
                        />
                      ) : (
                        <div className="h-10 px-3 rounded-lg bg-black/5 flex items-center text-black/60 font-bold">
                          No Logo
                        </div>
                      )}
                    </Link>
                  </div>
                  <button
                    type="button"
                    className="h-10 w-10 rounded-md border border-black/10 flex items-center justify-center hover:bg-black/5"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close menu"
                  >
                    <FaTimes className="text-black/70" />
                  </button>
                </div>
                <div className="mt-4 h-px bg-black/10" />
              </div>

              <div className="px-3 pb-6 overflow-y-auto h-[calc(100%-110px)]">
                <div className="grid gap-1">
                  {promoItems.map((it) => (
                    <NavItem
                      key={it.to}
                      to={it.to}
                      icon={it.icon}
                      label={it.label}
                      badge={it.badge}
                      colors={colors}
                      onClick={() => setSidebarOpen(false)}
                    />
                  ))}
                </div>

                <div className="my-4 h-px bg-black/10" />

                <div className="px-2 mb-2 text-[14px] font-extrabold text-black/40">
                  {t.gamesSection}
                </div>
                <div className="grid gap-1">
                  {gameItems.map((it) => (
                    <NavItem
                      key={it.to}
                      to={it.to}
                      icon={it.icon}
                      label={it.label}
                      badge={it.badge}
                      colors={colors}
                      onClick={() => setSidebarOpen(false)}
                    />
                  ))}
                </div>

                <div className="my-4 h-px bg-black/10" />

                <div className="px-2 mb-2 text-[14px] font-extrabold text-black/40">
                  {t.othersSection}
                </div>

                <div className="grid gap-1">
                  <button
                    type="button"
                    onClick={() => setLangOpen(true)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold text-black/70 hover:bg-black/5 transition"
                  >
                    <span className="w-8 h-8 text-2xl rounded-lg  flex items-center justify-center">
                      <FaGlobe className="text-black/80" />
                    </span>
                    <span>{t.language}</span>
                  </button>

                  {otherItems.map((item, index) => (
                    <NavItem
                      key={index}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      colors={colors}
                      onClick={() => setSidebarOpen(false)}
                    />
                  ))}

                  {/* ✅ optional: mobile logout in sidebar */}
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold text-black/70 hover:bg-black/5 transition"
                    >
                      <span className="w-8 h-8 rounded-lg text-2xl flex items-center justify-center">
                        <FaSignOutAlt className="text-black/80" />
                      </span>
                      <span>Logout</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Language modal – mobile */}
      <AnimatePresence>
        {langOpen && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[72] flex items-center justify-center lg:hidden"
            onClick={() => setLangOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-[90%] max-w-xs overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-black/10 text-center font-semibold">
                {t.language}
              </div>
              <button
                type="button"
                onClick={() => onSelectLang("Bangla")}
                className={`flex items-center gap-3 w-full px-5 py-4 hover:bg-black/5 transition ${
                  language === "Bangla" ? "bg-black/5" : ""
                }`}
              >
                <BdFlag className="h-7 w-7" />
                <span className="text-lg">বাংলা</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectLang("English")}
                className={`flex items-center gap-3 w-full px-5 py-4 hover:bg-black/5 transition ${
                  language === "English" ? "bg-black/5" : ""
                }`}
              >
                <EnFlag className="h-7 w-7" />
                <span className="text-lg">English</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navber;
