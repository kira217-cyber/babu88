// src/components/MenuItems/MenuItems.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";

const MASTER_API_URL = import.meta.env.VITE_MASTER_API_URL;
const PARTNET_URL = import.meta.env.VITE_PARTNER_URL;

const fetchMenuItemsColor = async () => {
  const { data } = await api.get("/api/menuitems-color");
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

const fetchGameMenu = async () => {
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
    console.error("White label game menu fetch failed:", error);
    return [];
  }
};

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${MASTER_API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
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
      className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-[2px] text-[10px] font-extrabold"
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
    queryKey: ["white-label-public-game-menu"],
    queryFn: fetchGameMenu,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

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

  const sortedMenuCats = useMemo(() => {
    const arr = Array.isArray(menuCats) ? [...menuCats] : [];

    arr.sort((a, b) => {
      const aRaw = parseInt(a?.order, 10);
      const bRaw = parseInt(b?.order, 10);

      const aHas = Number.isFinite(aRaw) && aRaw > 0;
      const bHas = Number.isFinite(bRaw) && bRaw > 0;

      if (aHas && bHas) {
        if (aRaw !== bRaw) return aRaw - bRaw;
      } else if (aHas && !bHas) {
        return -1;
      } else if (!aHas && bHas) {
        return 1;
      }

      const at = new Date(a?.createdAt || 0).getTime();
      const bt = new Date(b?.createdAt || 0).getTime();

      return at - bt;
    });

    return arr;
  }, [menuCats]);

  const dropdownMenus = useMemo(() => {
    return (sortedMenuCats || [])
      .filter((c) => c?.status === "active" || !c?.status)
      .map((c) => ({
        key: c._id,
        label: isBangla ? c.categoryName?.bn || "" : c.categoryName?.en || "",
        badge: c.badge || (c.jackpot ? "hot" : "none"),
        providers: Array.isArray(c.providers)
          ? c.providers.filter((p) => p?.status === "active" || !p?.status)
          : [],
        categoryId: c._id,
        menuKey: c.menuKey,
        order: c.order,
      }))
      .filter((c) => c.label);
  }, [sortedMenuCats, isBangla]);

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
    const drops = dropdownMenus.map((m) => ({
      ...m,
      type: "dropdown",
    }));

    return [...drops, ...fixedNav];
  }, [dropdownMenus, fixedNav]);

  const wrapRef = useRef(null);
  const closeTimer = useRef(null);
  const [openKey, setOpenKey] = useState(null);

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

  const onOpenPartner = (e) => {
    if (!PARTNET_URL) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative hidden lg:block" ref={wrapRef}>
      <div
        className="relative z-[60] w-full"
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
                      className="relative h-[56px] cursor-pointer bg-transparent px-4 font-bold"
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
                      className="relative inline-flex h-[56px] items-center px-4 font-bold"
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
                    className="relative inline-flex h-[56px] items-center px-4 font-bold"
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
                      ) {
                        return;
                      }

                      onHoverIn(e);
                    }}
                    onMouseLeave={(e) => {
                      if (
                        e.currentTarget.getAttribute("aria-current") === "page"
                      ) {
                        return;
                      }

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
            className="pointer-events-auto absolute left-0 z-[55] w-full"
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
                  <div className="mx-auto max-w-6xl p-5">
                    {openMenuObj.providers?.length ? (
                      <div className="grid grid-cols-5 gap-8">
                        {openMenuObj.providers.map((p) => (
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
                            className="group relative cursor-pointer overflow-hidden transition"
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
                                src={fileUrl(p.providerImage)}
                                alt={p.providerName}
                                className="h-66 w-full cursor-pointer object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>

                            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                              <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,rgba(245,180,0,0.25),transparent_60%)]" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center text-sm text-white/60">
                        {isBangla
                          ? "এই ক্যাটাগরিতে কোনো প্রোভাইডার নেই।"
                          : "No provider found in this category."}
                      </div>
                    )}

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
