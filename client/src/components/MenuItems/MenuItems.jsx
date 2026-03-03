// src/components/MenuItems/MenuItems.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";
import { useQuery } from "@tanstack/react-query";

// menu style config
const fetchMenuItemsColor = async () => {
  const { data } = await api.get("/api/menuitems-color");
  return data;
};

const PARTNET_URL = import.meta.env.VITE_PARTNER_URL;

// ✅ menu data from DB
const fetchGameMenu = async () => {
  const { data } = await api.get("/api/public/game-menu");
  return data?.data || [];
};

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== "string") return `rgba(0,0,0,${alpha})`;
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `rgba(0,0,0,${alpha})`;
};

const Badge = ({ type, colors }) => {
  if (!type || type === "none") return null;
  const bg = type === "new" ? colors.badgeNewBg : colors.badgeHotBg;
  const text = type === "new" ? colors.badgeNewText : colors.badgeHotText;

  return (
    <span
      style={{ backgroundColor: bg, color: text }}
      className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-[2px] rounded-full text-[10px] font-extrabold"
    >
      {type.toUpperCase()}
    </span>
  );
};

const MenuItems = () => {
  const { isBangla } = useLanguage();
  const navigate = useNavigate();

  const { data: cfg } = useQuery({
    queryKey: ["menuitems-color"],
    queryFn: fetchMenuItemsColor,
    staleTime: 1000 * 60 * 10,
  });

  const { data: menuCats = [] } = useQuery({
    queryKey: ["public-game-menu"],
    queryFn: fetchGameMenu,
    staleTime: 1000 * 60 * 2,
  });

  // fallback style same
  const colors = useMemo(() => {
    return {
      barBg: cfg?.barBg || "#3e3e3e",
      itemText: cfg?.itemText || "#ffffff",
      itemTextOpacity: cfg?.itemTextOpacity ?? 0.9,
      itemTextSize: cfg?.itemTextSize ?? 14,
      itemHoverText: cfg?.itemHoverText || "#ffffff",

      activeBg: cfg?.activeBg || "#f5b400",
      activeText: cfg?.activeText || "#000000",

      dropdownOpenBg: cfg?.dropdownOpenBg || "#000000",
      dropdownOpenBgOpacity: cfg?.dropdownOpenBgOpacity ?? 0.35,

      megaPanelBg: cfg?.megaPanelBg || "#000000",
      megaPanelBgOpacity: cfg?.megaPanelBgOpacity ?? 0.35,
      megaPanelBorder: cfg?.megaPanelBorder || "#ffffff",
      megaPanelBorderOpacity: cfg?.megaPanelBorderOpacity ?? 0.1,

      cardBg: cfg?.cardBg || "#ffffff",
      cardBgOpacity: cfg?.cardBgOpacity ?? 0.05,
      cardBorder: cfg?.cardBorder || "#ffffff",
      cardBorderOpacity: cfg?.cardBorderOpacity ?? 0.1,

      cardHoverBg: cfg?.cardHoverBg || "#ffffff",
      cardHoverBgOpacity: cfg?.cardHoverBgOpacity ?? 0.1,
      cardHoverBorder: cfg?.cardHoverBorder || "#f5b400",
      cardHoverBorderOpacity: cfg?.cardHoverBorderOpacity ?? 0.6,

      divider: cfg?.divider || "#ffffff",
      dividerOpacity: cfg?.dividerOpacity ?? 0.1,

      badgeNewBg: cfg?.badgeNewBg || "#20c55b",
      badgeNewText: cfg?.badgeNewText || "#ffffff",
      badgeHotBg: cfg?.badgeHotBg || "#ff3b30",
      badgeHotText: cfg?.badgeHotText || "#ffffff",
    };
  }, [cfg]);

  // ✅ SORT categories by order ASC (1 first, 9 last)
  // - order missing/0/invalid => goes LAST
  // - same order => older first (stable)
  const sortedMenuCats = useMemo(() => {
    const arr = Array.isArray(menuCats) ? [...menuCats] : [];

    arr.sort((a, b) => {
      const aRaw = parseInt(a?.order, 10);
      const bRaw = parseInt(b?.order, 10);

      const aHas = Number.isFinite(aRaw) && aRaw > 0;
      const bHas = Number.isFinite(bRaw) && bRaw > 0;

      if (aHas && bHas) {
        if (aRaw !== bRaw) return aRaw - bRaw; // ✅ ASC
      } else if (aHas && !bHas) {
        return -1; // a first
      } else if (!aHas && bHas) {
        return 1; // b first
      }

      // tie-break: oldest first
      const at = new Date(a?.createdAt || 0).getTime();
      const bt = new Date(b?.createdAt || 0).getTime();
      return at - bt;
    });

    return arr;
  }, [menuCats]);

  console.log("game category", sortedMenuCats)

  // ✅ DB categories -> dropdown menus
  const dropdownMenus = useMemo(() => {
    return (sortedMenuCats || []).map((c) => ({
      key: c._id,
      label: isBangla ? c.categoryName?.bn || "" : c.categoryName?.en || "",
      badge: c.badge || "none",
      providers: c.providers || [],
      categoryId: c._id,
      menuKey: c.menuKey,
      order: c.order,
    }));
  }, [sortedMenuCats, isBangla]);

  // other nav items fixed
  const fixedNav = useMemo(
    () => [
      {
        key: "promotion",
        label: isBangla ? "প্রমোশন" : "Promotion",
        type: "nav",
        to: "/promotions",
        badge: "none",
      },
      {
        key: "vip",
        label: "VIP",
        type: "nav",
        to: "/profile/vip",
        badge: "new",
      },
      {
        key: "affiliate",
        label: isBangla ? "অ্যাফিলিয়েট" : "Affiliate",
        type: "nav",
        to: "/affiliate",
        badge: "none",
      },
      {
        key: "rewards",
        label: isBangla ? "পুরস্কার" : "Rewards",
        type: "nav",
        to: "/profile/reward",
        badge: "new",
      },
      {
        key: "referral",
        label: isBangla ? "রেফারেল" : "Referral",
        type: "nav",
        to: "/profile/referral",
        badge: "none",
      },
    ],
    [isBangla],
  );

  const MENUS = useMemo(() => {
    const drops = dropdownMenus.map((m) => ({ ...m, type: "dropdown" }));
    return [...drops, ...fixedNav];
  }, [dropdownMenus, fixedNav]);

  const wrapRef = useRef(null);
  const [openKey, setOpenKey] = useState(null);
  const closeTimer = useRef(null);

  const openMenu = (key) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenKey(key);
  };
  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenKey(null), 120);
  };

  useEffect(() => {
    const onOutside = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpenKey(null);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const onHoverIn = (e) => {
    e.currentTarget.dataset.prevColor = e.currentTarget.style.color || "";
    e.currentTarget.style.color = colors.itemHoverText;
  };
  const onHoverOut = (e) => {
    const prev = e.currentTarget.dataset.prevColor;
    e.currentTarget.style.color = prev || "";
    delete e.currentTarget.dataset.prevColor;
  };

  const openMenuObj = useMemo(() => {
    return dropdownMenus.find((x) => x.key === openKey) || null;
  }, [dropdownMenus, openKey]);

  // ✅ NEW: external open safe (affiliate)
  const onOpenPartner = (e) => {
    if (!PARTNET_URL) {
      e.preventDefault();
      return;
    }
  };

  return (
    <div className="hidden lg:block relative" ref={wrapRef}>
      <div
        className="w-full relative z-[60]"
        style={{ backgroundColor: colors.barBg }}
      >
        <div className="mx-auto px-3">
          <div className="flex items-center gap-2">
            {MENUS.map((m) => {
              if (m.type === "dropdown") {
                const isOpen = openKey === m.key;

                return (
                  <div
                    key={m.key}
                    className="relative"
                    onMouseEnter={() => openMenu(m.key)}
                    onMouseLeave={closeMenu}
                  >
                    <button
                      type="button"
                      className="relative h-[56px] px-4 font-bold bg-transparent"
                      style={{
                        fontSize: `${colors.itemTextSize}px`,
                        color: colors.itemText,
                        opacity: colors.itemTextOpacity,
                        backgroundColor: isOpen
                          ? hexToRgba(
                              colors.dropdownOpenBg,
                              colors.dropdownOpenBgOpacity,
                            )
                          : "transparent",
                      }}
                      onMouseEnter={onHoverIn}
                      onMouseLeave={onHoverOut}
                      onClick={() => {
                        setOpenKey(null);
                        navigate(`/games/${m.categoryId}`);
                      }}
                    >
                      {m.label}
                      <Badge type={m.badge} colors={colors} />
                    </button>
                  </div>
                );
              }

              if (m.key === "affiliate") {
                return (
                  <div key={m.key} className="relative">
                    <a
                      href={PARTNET_URL || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onOpenPartner}
                      className="relative inline-flex items-center h-[56px] px-4 font-bold"
                      style={{
                        fontSize: `${colors.itemTextSize}px`,
                        backgroundColor: "transparent",
                        color: colors.itemText,
                        opacity: colors.itemTextOpacity,
                      }}
                      onMouseEnter={onHoverIn}
                      onMouseLeave={onHoverOut}
                    >
                      {m.label}
                      <Badge type={m.badge} colors={colors} />
                    </a>
                  </div>
                );
              }

              return (
                <div key={m.key} className="relative">
                  <NavLink
                    to={m.to}
                    className="relative inline-flex items-center h-[56px] px-4 font-bold"
                    style={({ isActive }) => ({
                      fontSize: `${colors.itemTextSize}px`,
                      backgroundColor: isActive
                        ? colors.activeBg
                        : "transparent",
                      color: isActive ? colors.activeText : colors.itemText,
                      opacity: isActive ? 1 : colors.itemTextOpacity,
                    })}
                    onMouseEnter={(e) => {
                      if (
                        e.currentTarget.getAttribute("aria-current") === "page"
                      )
                        return;
                      onHoverIn(e);
                    }}
                    onMouseLeave={(e) => {
                      if (
                        e.currentTarget.getAttribute("aria-current") === "page"
                      )
                        return;
                      onHoverOut(e);
                    }}
                  >
                    {m.label}
                    <Badge type={m.badge} colors={colors} />
                  </NavLink>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mega dropdown */}
      <AnimatePresence>
        {openKey && openMenuObj ? (
          <motion.div
            key="mega"
            onMouseEnter={() => openMenu(openKey)}
            onMouseLeave={closeMenu}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 w-full z-[55] pointer-events-auto"
          >
            <div className="w-full">
              <div className="mx-auto">
                <div
                  className="shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
                  style={{
                    backgroundColor: hexToRgba(
                      colors.megaPanelBg,
                      colors.megaPanelBgOpacity,
                    ),
                    border: `1px solid ${hexToRgba(
                      colors.megaPanelBorder,
                      colors.megaPanelBorderOpacity,
                    )}`,
                  }}
                >
                  <div className="p-5 max-w-6xl mx-auto">
                    <div className="grid grid-cols-5 gap-8">
                      {(openMenuObj.providers || []).map((p) => (
                        <motion.button
                          key={p._id}
                          whileHover={{ y: -3, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => {
                            setOpenKey(null);
                            navigate(
                              `/games/${openMenuObj.categoryId}?provider=${p._id}`,
                            );
                          }}
                          className="group relative overflow-hidden transition"
                          style={{
                            backgroundColor: hexToRgba(
                              colors.cardBg,
                              colors.cardBgOpacity,
                            ),
                            border: `1px solid ${hexToRgba(
                              colors.cardBorder,
                              colors.cardBorderOpacity,
                            )}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = hexToRgba(
                              colors.cardHoverBg,
                              colors.cardHoverBgOpacity,
                            );
                            e.currentTarget.style.border = `1px solid ${hexToRgba(
                              colors.cardHoverBorder,
                              colors.cardHoverBorderOpacity,
                            )}`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = hexToRgba(
                              colors.cardBg,
                              colors.cardBgOpacity,
                            );
                            e.currentTarget.style.border = `1px solid ${hexToRgba(
                              colors.cardBorder,
                              colors.cardBorderOpacity,
                            )}`;
                          }}
                          title={p.providerName}
                        >
                          <div className="aspect-[1/1] w-full">
                            <img
                              src={`${import.meta.env.VITE_API_URL}${p.providerImage}`}
                              alt={p.providerName}
                              className="w-full h-66 cursor-pointer object-cover"
                              loading="lazy"
                            />
                          </div>

                          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                            <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,rgba(245,180,0,0.25),transparent_60%)]" />
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <div
                      className="mt-5 h-px"
                      style={{
                        backgroundColor: hexToRgba(
                          colors.divider,
                          colors.dividerOpacity,
                        ),
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default MenuItems;
