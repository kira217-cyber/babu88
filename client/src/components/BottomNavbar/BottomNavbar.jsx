import React, { useMemo } from "react";
import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";

import { FaUsers, FaTags, FaHome, FaChartBar, FaGift } from "react-icons/fa";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";

// ✅ react-query + api
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

const fetchBottomNavbarColor = async () => {
  const { data } = await api.get("/api/bottom-navbar-color");
  return data;
};

const PARTNET_URL = import.meta.env.VITE_PARTNER_URL;

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

const BottomNavbar = () => {
  const { isBangla } = useLanguage();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // ✅ load colors
  const { data: cfg } = useQuery({
    queryKey: ["bottom-navbar-color"],
    queryFn: fetchBottomNavbarColor,
    staleTime: 1000 * 60 * 10,
  });

  // ✅ fallback keeps current design exactly
  const c = useMemo(() => {
    return {
      logoutLoginBg: cfg?.logoutLoginBg || "#FFCE01",
      logoutLoginText: cfg?.logoutLoginText || "#000000",
      logoutLoginTextSize: cfg?.logoutLoginTextSize ?? 16,

      logoutRegisterBg: cfg?.logoutRegisterBg || "#0066D1",
      logoutRegisterText: cfg?.logoutRegisterText || "#FFFFFF",
      logoutRegisterTextSize: cfg?.logoutRegisterTextSize ?? 16,

      barBg: cfg?.barBg || "#000000",
      barBorder: cfg?.barBorder || "#FFFFFF",
      barBorderOpacity: cfg?.barBorderOpacity ?? 0.1,

      iconActiveBg: cfg?.iconActiveBg || "#FFCE01",
      iconInactiveBg: cfg?.iconInactiveBg || "#000000",
      iconActiveText: cfg?.iconActiveText || "#000000",
      iconInactiveText: cfg?.iconInactiveText || "#FFFFFF",
      iconSize: cfg?.iconSize ?? 16,

      labelText: cfg?.labelText || "#FFFFFF",
      labelOpacity: cfg?.labelOpacity ?? 0.95,
      labelTextSize: cfg?.labelTextSize ?? 11,
    };
  }, [cfg]);

  const t = useMemo(() => {
    return {
      login: isBangla ? "লগইন" : "Login",
      register: isBangla ? "রেজিস্টার" : "Register",

      affiliates: isBangla ? "রেফার" : "Referral",
      promotions: isBangla ? "প্রমোশন" : "Promotions",
      home: isBangla ? "বাড়ি" : "Home",
      bettingPass: isBangla ? "আফিলিয়েট" : "Affiliate",
      rewards: isBangla ? "পুরস্কার" : "Rewards",
    };
  }, [isBangla]);

  const baseBtn =
    "flex-1 text-center py-4 font-extrabold text-md transition cursor-pointer";

  const itemBase =
    "flex flex-col items-center justify-center gap-1 py-2 flex-1 transition active:scale-[0.95]";

  // 🔥 Active / Inactive icon wrapper (design same)
  const iconClass = (isActive) =>
    `h-8 w-8 rounded-full flex items-center justify-center shadow-md transition`;

  // ✅ NEW: external open safe handler
  const onOpenPartner = (e) => {
    if (!PARTNET_URL) {
      e.preventDefault();
      return;
    }
    // let the <a> default open new tab
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
      {!isAuthenticated ? (
        /* Logged OUT */
        <div className="flex items-center">
          <NavLink
            to="/login"
            className={baseBtn}
            style={{
              backgroundColor: c.logoutLoginBg,
              color: c.logoutLoginText,
              fontSize: `${c.logoutLoginTextSize}px`,
            }}
          >
            {t.login}
          </NavLink>

          <NavLink
            to="/register"
            className={baseBtn}
            style={{
              backgroundColor: c.logoutRegisterBg,
              color: c.logoutRegisterText,
              fontSize: `${c.logoutRegisterTextSize}px`,
            }}
          >
            {t.register}
          </NavLink>
        </div>
      ) : (
        /* Logged IN */
        <div className="">
          <div
            className="rounded-t-xl shadow-[0_-10px_30px_rgba(0,0,0,0.35)] overflow-hidden"
            style={{
              backgroundColor: c.barBg,
              border: `1px solid ${hexToRgba(c.barBorder, c.barBorderOpacity)}`,
            }}
          >
            <div className="flex items-center justify-between">
              {/* Super */}
              <NavLink to="/profile/referral" className={itemBase}>
                {({ isActive }) => (
                  <>
                    <span
                      className={iconClass(isActive)}
                      style={{
                        backgroundColor: isActive
                          ? c.iconActiveBg
                          : c.iconInactiveBg,
                      }}
                    >
                      <FaUsers
                        style={{
                          color: isActive
                            ? c.iconActiveText
                            : c.iconInactiveText,
                          fontSize: `${c.iconSize}px`,
                        }}
                      />
                    </span>
                    <span
                      className="font-extrabold"
                      style={{
                        color: c.labelText,
                        opacity: c.labelOpacity,
                        fontSize: `${c.labelTextSize}px`,
                      }}
                    >
                      {t.affiliates}
                    </span>
                  </>
                )}
              </NavLink>

              {/* Promotions */}
              <NavLink to="/promotions" className={itemBase}>
                {({ isActive }) => (
                  <>
                    <span
                      className={iconClass(isActive)}
                      style={{
                        backgroundColor: isActive
                          ? c.iconActiveBg
                          : c.iconInactiveBg,
                      }}
                    >
                      <FaTags
                        style={{
                          color: isActive
                            ? c.iconActiveText
                            : c.iconInactiveText,
                          fontSize: `${c.iconSize}px`,
                        }}
                      />
                    </span>
                    <span
                      className="font-extrabold"
                      style={{
                        color: c.labelText,
                        opacity: c.labelOpacity,
                        fontSize: `${c.labelTextSize}px`,
                      }}
                    >
                      {t.promotions}
                    </span>
                  </>
                )}
              </NavLink>

              {/* Home */}
              <NavLink to="/" end className={itemBase}>
                {({ isActive }) => (
                  <>
                    <span
                      className={iconClass(isActive)}
                      style={{
                        backgroundColor: isActive
                          ? c.iconActiveBg
                          : c.iconInactiveBg,
                      }}
                    >
                      <FaHome
                        style={{
                          color: isActive
                            ? c.iconActiveText
                            : c.iconInactiveText,
                          fontSize: `${c.iconSize}px`,
                        }}
                      />
                    </span>
                    <span
                      className="font-extrabold"
                      style={{
                        color: c.labelText,
                        opacity: c.labelOpacity,
                        fontSize: `${c.labelTextSize}px`,
                      }}
                    >
                      {t.home}
                    </span>
                  </>
                )}
              </NavLink>

              {/* ✅ affiliate -> open PARTNET_URL in blank page */}
              <a
                href={PARTNET_URL || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onOpenPartner}
                className={itemBase}
              >
                <>
                  <span
                    className={iconClass(false)}
                    style={{
                      backgroundColor: c.iconInactiveBg,
                    }}
                  >
                    <FaChartBar
                      style={{
                        color: c.iconInactiveText,
                        fontSize: `${c.iconSize}px`,
                      }}
                    />
                  </span>
                  <span
                    className="font-extrabold"
                    style={{
                      color: c.labelText,
                      opacity: c.labelOpacity,
                      fontSize: `${c.labelTextSize}px`,
                    }}
                  >
                    {t.bettingPass}
                  </span>
                </>
              </a>

              {/* Rewards */}
              <NavLink to="/profile/reward" className={itemBase}>
                {({ isActive }) => (
                  <>
                    <span
                      className={iconClass(isActive)}
                      style={{
                        backgroundColor: isActive
                          ? c.iconActiveBg
                          : c.iconInactiveBg,
                      }}
                    >
                      <FaGift
                        style={{
                          color: isActive
                            ? c.iconActiveText
                            : c.iconInactiveText,
                          fontSize: `${c.iconSize}px`,
                        }}
                      />
                    </span>
                    <span
                      className="font-extrabold"
                      style={{
                        color: c.labelText,
                        opacity: c.labelOpacity,
                        fontSize: `${c.labelTextSize}px`,
                      }}
                    >
                      {t.rewards}
                    </span>
                  </>
                )}
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomNavbar;
