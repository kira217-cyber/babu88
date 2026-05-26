import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { TfiReload } from "react-icons/tfi";
import {
  FaBars,
  FaChevronDown,
  FaTimes,
  FaGlobe,
  FaUserAlt,
  FaBell,
  FaPlus,
  FaSignOutAlt,
} from "react-icons/fa";
import {
  FaTag,
  FaGift,
  FaUsers,
  FaRocket,
  FaCrown,
  FaGamepad,
} from "react-icons/fa";
import { useLanguage } from "../../Context/LanguageProvider";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import {
  selectAuth,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";

import { api } from "../../api/axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";

const MASTER_API_URL = import.meta.env.VITE_MASTER_API_URL;
const PARTNET_URL = import.meta.env.VITE_PARTNER_URL;

const fetchBranding = async () => {
  const { data } = await api.get("/api/site-branding");
  return data;
};

const fetchNavbarColor = async () => {
  const { data } = await api.get("/api/navbar-color");
  return data;
};

const fetchMyBalance = async (token) => {
  const { data } = await api.get("/api/users/me/balance", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const getSavedApiKey = async () => {
  const res = await api.get("/api/admin/game-api-key");
  const setting = res?.data?.data?.setting;

  if (!setting?.apiKey || !setting?.isActive || !setting?.isVerified) {
    return "";
  }

  return setting.apiKey;
};

const fetchWhiteLabelGameMenu = async () => {
  try {
    const apiKey = await getSavedApiKey();

    if (!apiKey || !MASTER_API_URL) {
      return [];
    }

    const { data } = await axios.get(
      `${MASTER_API_URL}/api/white-label/game-menu`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      },
    );

    return data?.data || [];
  } catch (error) {
    console.error("White label mobile game menu fetch failed:", error);
    return [];
  }
};

const masterFileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;

  const base = String(MASTER_API_URL || "").replace(/\/+$/, "");
  const cleanPath = String(path).startsWith("/") ? path : `/${path}`;

  return `${base}${cleanPath}`;
};

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
    <span className="absolute left-0 top-1/2 h-[28%] w-full -translate-y-1/2 bg-white/95" />
    <span className="absolute left-1/2 top-0 h-full w-[16%] -translate-x-1/2 bg-[#C8102E]" />
    <span className="absolute left-0 top-1/2 h-[16%] w-full -translate-y-1/2 bg-[#C8102E]" />
  </span>
);

const Badge = ({ variant = "hot", children }) => {
  const cls =
    variant === "new" ? "bg-[#18b84a] text-white" : "bg-[#ff3b30] text-white";

  return (
    <span
      className={`ml-auto inline-flex items-center justify-center rounded-full px-2 py-[2px] text-[10px] font-extrabold ${cls}`}
    >
      {children}
    </span>
  );
};

const NavItem = ({
  to,
  icon: Icon,
  iconImg,
  label,
  badge,
  onClick,
  colors,
  externalUrl,
}) => {
  const baseCls =
    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition font-semibold cursor-pointer";

  if (externalUrl) {
    return (
      <a
        href={externalUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (typeof onClick === "function") onClick();
        }}
        className={baseCls}
        style={{
          backgroundColor: colors.sidebarLinkBg,
          color: colors.sidebarLinkText,
          fontSize: `${colors.sidebarLinkTextSize}px`,
        }}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg">
          {iconImg ? (
            <img
              src={iconImg}
              alt={label}
              className="h-7 w-7 object-contain"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Icon
              className="text-2xl"
              style={{ color: "currentColor", opacity: 0.9 }}
            />
          )}
        </span>

        <span className="truncate">{label}</span>

        {badge?.type ? <Badge variant={badge.type}>{badge.text}</Badge> : null}
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={baseCls}
      style={({ isActive }) => ({
        backgroundColor: isActive
          ? colors.sidebarActiveBg
          : colors.sidebarLinkBg,
        color: isActive ? colors.sidebarActiveText : colors.sidebarLinkText,
        fontSize: `${colors.sidebarLinkTextSize}px`,
      })}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg">
        {iconImg ? (
          <img
            src={iconImg}
            alt={label}
            className="h-7 w-7 object-contain"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <Icon
            className="text-2xl"
            style={{ color: "currentColor", opacity: 0.9 }}
          />
        )}
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

  const { data: navColor } = useQuery({
    queryKey: ["navbar-color"],
    queryFn: fetchNavbarColor,
    staleTime: 1000 * 60 * 10,
  });

  const { data: whiteLabelMenu = [] } = useQuery({
    queryKey: ["white-label-mobile-game-menu"],
    queryFn: fetchWhiteLabelGameMenu,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const API_URL = import.meta.env.VITE_API_URL;

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

  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const token = auth?.token;
  const user = auth?.user;

  const username = user?.username || user?.name || "User";
  const notifCount = user?.notificationsCount ?? 0;

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

  const [balanceState, setBalanceState] = useState(0);
  const [currencyState, setCurrencyState] = useState("BDT");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!token) return;

      try {
        const d = await fetchMyBalance(token);
        if (!mounted) return;

        setBalanceState(Number(d?.balance) || 0);
        setCurrencyState(d?.currency || "BDT");
      } catch {
        // silent
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [token]);

  const currencySymbol = useMemo(() => {
    return currencyState === "USDT" ? "$" : "৳";
  }, [currencyState]);

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
      affiliates: isBangla ? "অ্যাফিলিয়েট" : "Affiliate",
      vip: isBangla ? "বেটিং: ভিআইপি" : "Betting: VIP",

      balanceReloadFail: isBangla
        ? "ব্যালেন্স রিফ্রেশ ব্যর্থ"
        : "Balance refresh failed",

      logoutOk: isBangla ? "লগআউট সফল হয়েছে" : "Logged out successfully",
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

    return () => {
      document.body.style.overflow = prev;
    };
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
    toast.success(t.logoutOk);
    setSidebarOpen(false);
    setLangOpen(false);
    navigate("/");
  };

  const [balReloading, setBalReloading] = useState(false);

  const reloadBalance = useCallback(async () => {
    if (!token) return;

    try {
      setBalReloading(true);

      const d = await fetchMyBalance(token);

      setBalanceState(Number(d?.balance) || 0);
      setCurrencyState(d?.currency || "BDT");
    } catch {
      toast.error(t.balanceReloadFail, { autoClose: 1800 });
    } finally {
      setBalReloading(false);
    }
  }, [token, t.balanceReloadFail]);

  const promoItems = [
    { to: "/promotions", icon: FaTag, label: t.promotions },
    {
      to: "/profile/reward",
      icon: FaGift,
      label: t.rewards,
      badge: { type: "new", text: "new" },
    },
    {
      to: "/profile/referral",
      icon: FaUsers,
      label: t.referral,
      badge: { type: "hot", text: "HOT" },
    },
    {
      to: "/affiliate",
      icon: FaRocket,
      label: t.affiliates,
      externalUrl: PARTNET_URL,
    },
    {
      to: "/profile/vip",
      icon: FaCrown,
      label: t.vip,
      badge: { type: "hot", text: "HOT" },
    },
  ];

  const gameItems = useMemo(() => {
    const list = Array.isArray(whiteLabelMenu) ? [...whiteLabelMenu] : [];

    list.sort((a, b) => {
      const ao = Number(a?.order);
      const bo = Number(b?.order);

      const aOrd = Number.isFinite(ao) && ao > 0 ? ao : 999999;
      const bOrd = Number.isFinite(bo) && bo > 0 ? bo : 999999;

      if (aOrd !== bOrd) return aOrd - bOrd;

      const at = new Date(a?.createdAt || 0).getTime();
      const bt = new Date(b?.createdAt || 0).getTime();

      return bt - at;
    });

    return list
      .filter((c) => c?.status === "active" || !c?.status)
      .map((c) => {
        const label = isBangla ? c.categoryName?.bn : c.categoryName?.en;
        const iconImg = c.iconImage ? masterFileUrl(c.iconImage) : "";

        return {
          to: `/games-mobile/${c._id}`,
          icon: FaGamepad,
          iconImg,
          label: label || "Category",
        };
      });
  }, [whiteLabelMenu, isBangla]);

  const otherItems = [];

  return (
    <>
      <header className="w-full border-t-2 border-black/70 bg-white shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
        <div className="mx-auto px-3 sm:px-4">
          <div className="flex h-[72px] items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-black/10 transition hover:bg-black/5 active:scale-[0.98] lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <FaBars className="text-black/80" />
              </button>

              <Link
                to="/"
                className="flex cursor-pointer select-none items-center gap-2"
              >
                {view.logoUrl ? (
                  <img
                    src={view.logoUrl}
                    alt="Site Logo"
                    className="h-12 w-38 md:h-14 md:w-40 lg:h-16 lg:w-64"
                    loading="lazy"
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-10 items-center rounded-lg bg-black/5 px-3 font-bold text-black/60">
                    No Logo
                  </div>
                )}
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-8">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    style={{
                      backgroundColor: colors.loginBg,
                      color: colors.loginText,
                      fontSize: `${colors.loginTextSize}px`,
                    }}
                    className="hidden h-10 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-extrabold shadow-sm transition hover:brightness-95 active:scale-[0.99] sm:inline-flex"
                  >
                    {t.login}
                  </Link>

                  <Link
                    to="/register"
                    style={{
                      backgroundColor: colors.registerBg,
                      color: colors.registerText,
                      fontSize: `${colors.registerTextSize}px`,
                    }}
                    className="hidden h-10 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-extrabold shadow-sm transition hover:brightness-95 active:scale-[0.99] sm:inline-flex"
                  >
                    {t.join}
                  </Link>

                  <div className="relative z-[70]" ref={langRef}>
                    <button
                      type="button"
                      onClick={() => setLangOpen((v) => !v)}
                      className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-[#d9d9d9] px-3 transition hover:brightness-95 active:scale-[0.99]"
                      aria-haspopup="menu"
                      aria-expanded={langOpen}
                    >
                      {currentFlag}
                      <FaChevronDown className="text-sm text-black/70" />
                    </button>

                    {langOpen && (
                      <div
                        className="absolute right-0 mt-2 w-[180px] overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg"
                        role="menu"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectLang("Bangla")}
                          className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-sm font-semibold hover:bg-black/5 ${
                            language === "Bangla" ? "bg-black/5" : ""
                          }`}
                        >
                          <BdFlag className="h-6 w-6" />
                          বাংলা
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectLang("English")}
                          className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-sm font-semibold hover:bg-black/5 ${
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
                <div className="flex items-center gap-3">
                  <span className="hidden text-[14px] font-semibold text-black sm:inline">
                    {username}
                  </span>

                  <Link
                    to="/profile/me"
                    style={{ backgroundColor: colors.iconBg }}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full shadow-sm transition hover:brightness-95 active:scale-[0.99]"
                    aria-label="Profile"
                    title="Profile"
                  >
                    <FaUserAlt
                      style={{ color: colors.iconText }}
                      className="text-[16px]"
                    />
                  </Link>

                  <Link
                    to="/profile/inbox"
                    style={{ backgroundColor: colors.iconBg }}
                    className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full shadow-sm transition hover:brightness-95 active:scale-[0.99]"
                    aria-label="Notifications"
                    title="Notifications"
                  >
                    <FaBell
                      style={{ color: colors.iconText }}
                      className="text-[16px]"
                    />

                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#0b78f0] px-1 text-[11px] font-extrabold text-white">
                      {notifCount}
                    </span>
                  </Link>

                  <span className="hidden h-8 w-px bg-black/20 sm:block" />

                  <div className="hidden h-10 items-center rounded-full bg-[#e6e6e6] px-4 text-[14px] font-extrabold text-black shadow-sm md:flex">
                    {currencySymbol} {Number(balanceState).toFixed(2)}
                    <button
                      type="button"
                      onClick={reloadBalance}
                      disabled={balReloading}
                      className="ml-2 cursor-pointer font-bold disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Reload balance"
                      title="Reload balance"
                    >
                      <span
                        className={`${
                          balReloading ? "inline-block animate-spin" : ""
                        }`}
                      >
                        <TfiReload />
                      </span>
                    </button>
                  </div>

                  <Link
                    to="/profile/auto-deposit"
                    className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#0b78f0] text-white shadow-sm transition hover:brightness-95 active:scale-[0.99] md:flex"
                    aria-label="Add balance"
                    title="Add balance"
                  >
                    <FaPlus />
                  </Link>

                  <span className="hidden h-8 w-px bg-black/20 sm:block" />

                  <div
                    className="relative z-[70] hidden md:block"
                    ref={langRef}
                  >
                    <button
                      type="button"
                      onClick={() => setLangOpen((v) => !v)}
                      className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-[#d9d9d9] px-3 transition hover:brightness-95 active:scale-[0.99]"
                      aria-haspopup="menu"
                      aria-expanded={langOpen}
                    >
                      {currentFlag}
                      <FaChevronDown className="text-sm text-black/70" />
                    </button>

                    {langOpen && (
                      <div
                        className="absolute right-0 mt-2 w-[180px] overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg"
                        role="menu"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectLang("Bangla")}
                          className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-sm font-semibold hover:bg-black/5 ${
                            language === "Bangla" ? "bg-black/5" : ""
                          }`}
                        >
                          <BdFlag className="h-6 w-6" />
                          বাংলা
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectLang("English")}
                          className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-sm font-semibold hover:bg-black/5 ${
                            language === "English" ? "bg-black/5" : ""
                          }`}
                        >
                          <EnFlag className="h-6 w-6" />
                          English
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-black/5 transition hover:bg-black/10 active:scale-[0.99]"
                    aria-label="Logout"
                    title="Logout"
                  >
                    <FaSignOutAlt className="text-black/80" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[70] cursor-pointer bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{
                x: 0,
                transition: { type: "spring", damping: 22, stiffness: 180 },
              }}
              exit={{
                x: "-100%",
                transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
              }}
              className="fixed left-0 top-0 z-[71] h-full w-[82%] max-w-[320px] bg-white shadow-2xl lg:hidden"
            >
              <div className="px-4 pb-4 pt-5">
                <div className="flex items-center justify-between">
                  <Link
                    to="/"
                    className="flex cursor-pointer select-none items-center gap-2"
                  >
                    {view.logoUrl ? (
                      <img
                        src={view.logoUrl}
                        alt="Site Logo"
                        className="h-14 w-48"
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-10 items-center rounded-lg bg-black/5 px-3 font-bold text-black/60">
                        No Logo
                      </div>
                    )}
                  </Link>

                  <button
                    type="button"
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-black/10 hover:bg-black/5"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close menu"
                  >
                    <FaTimes className="text-black/70" />
                  </button>
                </div>

                <div className="mt-4 h-px bg-black/10" />
              </div>

              <div className="h-[calc(100%-110px)] overflow-y-auto px-3 pb-6">
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
                      externalUrl={it.externalUrl}
                    />
                  ))}
                </div>

                <div className="my-4 h-px bg-black/10" />

                <div className="mb-2 px-2 text-[14px] font-extrabold text-black/40">
                  {t.gamesSection}
                </div>

                <div className="grid gap-1">
                  {gameItems.map((it) => (
                    <NavItem
                      key={it.to}
                      to={it.to}
                      icon={it.icon}
                      iconImg={it.iconImg}
                      label={it.label}
                      colors={colors}
                      onClick={() => setSidebarOpen(false)}
                    />
                  ))}
                </div>

                <div className="my-4 h-px bg-black/10" />

                <div className="mb-2 px-2 text-[14px] font-extrabold text-black/40">
                  {t.othersSection}
                </div>

                <div className="grid gap-1">
                  <button
                    type="button"
                    onClick={() => setLangOpen(true)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold text-black/70 transition hover:bg-black/5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-2xl">
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

                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold text-black/70 transition hover:bg-black/5"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg text-2xl">
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

      <AnimatePresence>
        {langOpen && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[72] flex cursor-pointer items-center justify-center bg-black/60 lg:hidden"
            onClick={() => setLangOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-[90%] max-w-xs overflow-hidden rounded-2xl bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-black/10 p-4 text-center font-semibold">
                {t.language}
              </div>

              <button
                type="button"
                onClick={() => onSelectLang("Bangla")}
                className={`flex w-full cursor-pointer items-center gap-3 px-5 py-4 transition hover:bg-black/5 ${
                  language === "Bangla" ? "bg-black/5" : ""
                }`}
              >
                <BdFlag className="h-7 w-7" />
                <span className="text-lg">বাংলা</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectLang("English")}
                className={`flex w-full cursor-pointer items-center gap-3 px-5 py-4 transition hover:bg-black/5 ${
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
