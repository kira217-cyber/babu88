import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const Navbar = () => {
  const { language, changeLanguage, isBangla } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);

  const langRef = useRef(null);
  const mobileLangRef = useRef(null);

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
      // desktop dropdown outside click
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
      // mobile dropdown outside click
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

  const navClass = ({ isActive }) =>
    `text-md font-bold tracking-wide ${
      isActive ? "text-yellow-500" : "text-black hover:text-yellow-500"
    }`;

  const activeLang = languages.find((l) => l.key === language) || languages[0];

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full bg-white z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1">
              <span className="text-3xl font-extrabold italic text-black">
                BABU
              </span>
              <span className="text-3xl font-extrabold italic text-yellow-500">
                88
              </span>
            </Link>

            {/* Right Side (Desktop) */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Desktop Menu */}
              {/* <div className="hidden lg:flex items-center gap-8 mr-4">
                {menuItems.map((item) => (
                  <NavLink key={item.path} to={item.path} className={navClass}>
                    {item.name}
                  </NavLink>
                ))}
              </div> */}
              <Link
                to="/login"
                className="bg-yellow-500 text-black font-bold text-sm px-5 py-2 rounded-md hover:bg-yellow-600 transition"
              >
                {t.btn.login}
              </Link>

              <Link
                to="/register"
                className="bg-[#4b4b4b] text-white font-bold text-sm px-5 py-2 rounded-md hover:bg-[#3f3f3f] transition"
              >
                {t.btn.join}
              </Link>

              {/* Language Dropdown (Desktop) */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangOpen((p) => !p)}
                  className="flex items-center gap-2 bg-[#4b4b4b] text-white font-bold text-sm px-4 py-2 rounded-md hover:bg-[#3f3f3f] transition"
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
                      className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg overflow-hidden"
                    >
                      {languages.map((lng) => (
                        <button
                          key={lng.key}
                          onClick={() => {
                            changeLanguage(lng.key);
                            setLangOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-sm flex items-center gap-3 hover:bg-gray-100 ${
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
              className="lg:hidden text-black"
              aria-label="Open menu"
            >
              <FaBars size={22} />
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-gray-200" />
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
              className="fixed top-0 left-0 w-72 h-full bg-white z-50 shadow-xl lg:hidden"
            >
              {/* Header */}
              <div className="p-4 flex justify-between items-center border-b">
                <Link to="/" onClick={() => setMobileOpen(false)}>
                  <span className="text-2xl font-extrabold italic text-black">
                    BABU
                  </span>
                  <span className="text-2xl font-extrabold italic text-yellow-500">
                    88
                  </span>
                </Link>

                <FaTimes
                  size={22}
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileLangOpen(false);
                  }}
                  className="cursor-pointer text-black"
                />
              </div>

              <div className="p-4 space-y-3">
                {/* Menu items */}
                {/* {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      setMobileOpen(false);
                      setMobileLangOpen(false);
                    }}
                    className={({ isActive }) =>
                      `block py-2 text-base font-semibold ${
                        isActive ? "text-yellow-500" : "text-black"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))} */}

                {/* ✅ Mobile Login/Register Buttons */}
                <div className="pt-2 space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full bg-yellow-500 text-black font-bold text-sm px-5 py-3 rounded-md text-center hover:bg-yellow-600 transition"
                  >
                    {t.btn.login}
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full bg-[#4b4b4b] text-white font-bold text-sm px-5 py-3 rounded-md text-center hover:bg-[#3f3f3f] transition"
                  >
                    {t.btn.join}
                  </Link>
                </div>

                {/* ✅ Mobile Language Dropdown (same as desktop) */}
                <div className="pt-4 border-t" ref={mobileLangRef}>
                  <button
                    onClick={() => setMobileLangOpen((p) => !p)}
                    className="w-full flex items-center justify-between gap-2 bg-[#4b4b4b] text-white font-bold text-sm px-4 py-3 rounded-md hover:bg-[#3f3f3f] transition"
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
                        className="mt-2 w-full bg-white border rounded-md shadow-lg overflow-hidden"
                      >
                        {languages.map((lng) => (
                          <button
                            key={lng.key}
                            onClick={() => {
                              changeLanguage(lng.key);
                              setMobileLangOpen(false);
                              // mobile sidebar close না করতে চাইলে এই লাইন কেটে দাও
                              // setMobileOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-sm flex items-center gap-3 hover:bg-gray-100 ${
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
