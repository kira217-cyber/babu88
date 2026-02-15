import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { api } from "../../api/axios";

const Navbar = () => {
  const { language, changeLanguage, isBangla } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);

  const langRef = useRef(null);
  const mobileLangRef = useRef(null);

  // ✅ Site Meta (logo) from DB
  const { data: siteMeta, isLoading: metaLoading } = useQuery({
    queryKey: ["aff-site-meta"],
    queryFn: async () => {
      const res = await api.get("/api/aff-site-meta");
      return res.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

  // ✅ Navbar Color Config from DB
  const { data: navCfg, isLoading: navCfgLoading } = useQuery({
    queryKey: ["aff-navbar-color"],
    queryFn: async () => {
      const res = await api.get("/api/aff-navbar-color");
      return res.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

  const fallbackLogo =
    "https://babu88agents.com/bd/wp-content/uploads/sites/2/2025/07/Babu88-Logo.jpg";

  const logoUrl = siteMeta?.logoUrl || fallbackLogo;

  /* ================= TEXT ================= */
  const t = useMemo(() => {
    return {
      menu: {
        promotion: isBangla ? "প্রোমোশন" : "Promotions",
        legend: isBangla ? "BABU লিজেন্ড" : "BABU Legend",
        faq: "FAQ",
      },
      btn: {
        login: isBangla ? "লগইন করুন" : "Login",
        join: isBangla ? "প্রথমেই যোগদান করুন" : "Join Now",
      },
      langLabel: isBangla ? "বাংলা" : "English",
    };
  }, [isBangla]);

  /* ================= MENU ================= */
  const menuItems = useMemo(
    () => [
      { name: t.menu.promotion, path: "/promotion" },
      { name: t.menu.legend, path: "/legend" },
      { name: t.menu.faq, path: "/faq" },
    ],
    [t],
  );

  /* ================= LANG ================= */
  const languages = useMemo(
    () => [
      {
        key: "Bangla",
        label: "বাংলা",
        flag: "https://flagcdn.com/w40/bd.png",
      },
      {
        key: "English",
        label: "English",
        flag: "https://flagcdn.com/w40/us.png",
      },
    ],
    [],
  );

  /* ================= HANDLERS ================= */
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
      if (mobileLangRef.current && !mobileLangRef.current.contains(e.target)) {
        setMobileLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setLangOpen(false);
        setMobileLangOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeLang = languages.find((l) => l.key === language) || languages[0];

  // ✅ Skeleton theme (neutral)
  const sk = {
    baseColor: "rgba(0,0,0,0.08)",
    highlightColor: "rgba(0,0,0,0.14)",
  };

  // ✅ Defaults fallback (if loading / missing)
  const cfg = navCfg || {};
  const cssVars = {
    "--nav-bg": cfg.navBg || "#ffffff",
    "--nav-border": cfg.navBorder || "#e5e7eb",

    "--nav-text": cfg.textColor || "#000000",
    "--nav-hover": cfg.hoverTextColor || "#f59e0b",
    "--nav-active": cfg.activeTextColor || "#f59e0b",
    "--nav-menu-size": `${cfg.menuTextSize ?? 16}px`,

    "--login-bg": cfg.loginBg || "#f59e0b",
    "--login-hover-bg": cfg.loginHoverBg || "#d97706",
    "--login-text": cfg.loginTextColor || "#000000",
    "--login-size": `${cfg.loginTextSize ?? 14}px`,

    "--join-bg": cfg.joinBg || "#4b4b4b",
    "--join-hover-bg": cfg.joinHoverBg || "#3f3f3f",
    "--join-text": cfg.joinTextColor || "#ffffff",
    "--join-size": `${cfg.joinTextSize ?? 14}px`,

    "--lang-bg": cfg.langBtnBg || "#4b4b4b",
    "--lang-hover-bg": cfg.langBtnHoverBg || "#3f3f3f",
    "--lang-text": cfg.langBtnTextColor || "#ffffff",
    "--lang-size": `${cfg.langBtnTextSize ?? 14}px`,

    "--dd-bg": cfg.dropdownBg || "#ffffff",
    "--dd-hover-bg": cfg.dropdownHoverBg || "#f3f4f6",
    "--dd-text": cfg.dropdownTextColor || "#111827",
    "--dd-border": cfg.dropdownBorder || "#e5e7eb",
  };

  const navClass = ({ isActive }) =>
    `font-bold tracking-wide text-[length:var(--nav-menu-size)] ${
      isActive
        ? "text-[color:var(--nav-active)]"
        : "text-[color:var(--nav-text)] hover:text-[color:var(--nav-hover)]"
    }`;

  const logoW = cfg.logoWidth ?? 192;
  const logoH = cfg.logoHeight ?? 48;

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav
        style={cssVars}
        className="fixed top-0 left-0 w-full z-50 bg-[color:var(--nav-bg)]"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1">
              {metaLoading ? (
                <div className="h-12 w-48">
                  <Skeleton {...sk} height="100%" />
                </div>
              ) : (
                <img
                  style={{ width: `${logoW}px`, height: `${logoH}px` }}
                  className="object-contain"
                  src={logoUrl}
                  alt=""
                />
              )}
            </Link>

            {/* Right Side (Desktop) */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Desktop Menu (তুমি চাইলে on করে দিবে) */}
              {/* <div className="hidden lg:flex items-center gap-8 mr-4">
                {menuItems.map((item) => (
                  <NavLink key={item.path} to={item.path} className={navClass}>
                    {item.name}
                  </NavLink>
                ))}
              </div> */}

              <Link
                to="/login"
                className="font-bold px-5 py-2 rounded-md transition
                  bg-[color:var(--login-bg)] text-[color:var(--login-text)]
                  hover:bg-[color:var(--login-hover-bg)]
                  text-[length:var(--login-size)]"
              >
                {t.btn.login}
              </Link>

              <Link
                to="/register"
                className="font-bold px-5 py-2 rounded-md transition
                  bg-[color:var(--join-bg)] text-[color:var(--join-text)]
                  hover:bg-[color:var(--join-hover-bg)]
                  text-[length:var(--join-size)]"
              >
                {t.btn.join}
              </Link>

              {/* Language Dropdown (Desktop) */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen((p) => !p)}
                  className="flex items-center gap-2 font-bold px-4 py-2 rounded-md transition
                    bg-[color:var(--lang-bg)] text-[color:var(--lang-text)]
                    hover:bg-[color:var(--lang-hover-bg)]
                    text-[length:var(--lang-size)]"
                >
                  <img
                    src={activeLang.flag}
                    alt={activeLang.label}
                    className="w-5 h-5 rounded-sm object-cover"
                  />
                  <span>{t.langLabel}</span>
                  <ChevronDown size={18} />
                </button>

                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-44 border rounded-md shadow-lg overflow-hidden
                        bg-[color:var(--dd-bg)] border-[color:var(--dd-border)]"
                    >
                      {languages.map((lng) => (
                        <button
                          key={lng.key}
                          onClick={() => {
                            changeLanguage(lng.key);
                            setLangOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-sm flex items-center gap-3
                            hover:bg-[color:var(--dd-hover-bg)]
                            text-[color:var(--dd-text)]
                            ${
                              language === lng.key ? "font-bold" : "font-medium"
                            }`}
                        >
                          <img
                            src={lng.flag}
                            alt={lng.label}
                            className="w-5 h-5 rounded-sm object-cover"
                          />
                          {lng.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-[color:var(--nav-text)]"
              aria-label="Open menu"
            >
              <FaBars size={22} />
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-[color:var(--nav-border)]" />
      </nav>

      {/* ================= MOBILE SIDEBAR ================= */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setMobileOpen(false);
                setMobileLangOpen(false);
              }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25 }}
              className="fixed top-0 left-0 w-72 h-full z-50 shadow-xl lg:hidden
                bg-[color:var(--nav-bg)]"
              style={cssVars}
            >
              {/* Header */}
              <div className="p-4 flex justify-between items-center border-b border-[color:var(--nav-border)]">
                <Link to="/" onClick={() => setMobileOpen(false)}>
                  {metaLoading ? (
                    <div className="w-48">
                      <Skeleton {...sk} height={36} />
                    </div>
                  ) : (
                    <img
                      style={{ width: `${logoW}px`, height: `${logoH}px` }}
                      className="object-contain"
                      src={logoUrl}
                      alt=""
                    />
                  )}
                </Link>

                <FaTimes
                  size={22}
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileLangOpen(false);
                  }}
                  className="cursor-pointer text-[color:var(--nav-text)]"
                />
              </div>

              <div className="p-4 space-y-3">
                {/* ✅ Mobile Login/Register Buttons */}
                <div className="pt-2 space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full font-bold px-5 py-3 rounded-md text-center transition
                      bg-[color:var(--login-bg)] text-[color:var(--login-text)]
                      hover:bg-[color:var(--login-hover-bg)]
                      text-[length:var(--login-size)]"
                  >
                    {t.btn.login}
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full font-bold px-5 py-3 rounded-md text-center transition
                      bg-[color:var(--join-bg)] text-[color:var(--join-text)]
                      hover:bg-[color:var(--join-hover-bg)]
                      text-[length:var(--join-size)]"
                  >
                    {t.btn.join}
                  </Link>
                </div>

                {/* ✅ Mobile Language Dropdown */}
                <div
                  className="pt-4 border-t border-[color:var(--nav-border)]"
                  ref={mobileLangRef}
                >
                  <button
                    onClick={() => setMobileLangOpen((p) => !p)}
                    className="w-full flex items-center justify-between gap-2 font-bold px-4 py-3 rounded-md transition
                      bg-[color:var(--lang-bg)] text-[color:var(--lang-text)]
                      hover:bg-[color:var(--lang-hover-bg)]
                      text-[length:var(--lang-size)]"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={activeLang.flag}
                        alt={activeLang.label}
                        className="w-5 h-5 rounded-sm object-cover"
                      />
                      <span>{t.langLabel}</span>
                    </div>
                    <ChevronDown size={18} />
                  </button>

                  <AnimatePresence>
                    {mobileLangOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-2 w-full border rounded-md shadow-lg overflow-hidden
                          bg-[color:var(--dd-bg)] border-[color:var(--dd-border)]"
                      >
                        {languages.map((lng) => (
                          <button
                            key={lng.key}
                            onClick={() => {
                              changeLanguage(lng.key);
                              setMobileLangOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-sm flex items-center gap-3
                              hover:bg-[color:var(--dd-hover-bg)]
                              text-[color:var(--dd-text)]
                              ${
                                language === lng.key
                                  ? "font-bold"
                                  : "font-medium"
                              }`}
                          >
                            <img
                              src={lng.flag}
                              alt={lng.label}
                              className="w-5 h-5 rounded-sm object-cover"
                            />
                            {lng.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* spacer */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
