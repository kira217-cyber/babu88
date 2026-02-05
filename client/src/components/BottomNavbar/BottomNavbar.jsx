import React, { useMemo } from "react";
import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";

import { FaUsers, FaTags, FaHome, FaChartBar, FaGift } from "react-icons/fa";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";

const BottomNavbar = () => {
  const { isBangla } = useLanguage();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const t = useMemo(() => {
    return {
      login: isBangla ? "লগইন" : "Login",
      register: isBangla ? "রেজিস্টার" : "Register",

      affiliates: isBangla ? "সুপার" : "Super",
      promotions: isBangla ? "প্রমোশন" : "Promotions",
      home: isBangla ? "বাড়ি" : "Home",
      bettingPass: isBangla ? "বেটিং" : "Betting",
      rewards: isBangla ? "পুরস্কার" : "Rewards",
    };
  }, [isBangla]);

  const baseBtn =
    "flex-1 text-center py-4 font-extrabold text-md transition cursor-pointer";

  const itemBase =
    "flex flex-col items-center justify-center gap-1 py-2 flex-1 transition active:scale-[0.95]";

  // 🔥 Active / Inactive icon wrapper
  const iconClass = (isActive) =>
    `h-8 w-8 rounded-full flex items-center justify-center shadow-md transition
     ${isActive ? "bg-[#FFCE01]" : "bg-black"}`;

  const iconColor = (isActive) =>
    `${isActive ? "text-black" : "text-white"} text-[16px]`;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
      {!isAuthenticated ? (
        /* Logged OUT */
        <div className="flex items-center">
          <NavLink to="/login" className={`${baseBtn} bg-[#FFCE01] text-black`}>
            {t.login}
          </NavLink>

          <NavLink
            to="/register"
            className={`${baseBtn} bg-[#0066D1] text-white`}
          >
            {t.register}
          </NavLink>
        </div>
      ) : (
        /* Logged IN */
        <div className="">
          <div className="bg-black rounded-t-xl shadow-[0_-10px_30px_rgba(0,0,0,0.35)] border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between">
              {/* Super */}
              <NavLink to="/super-affiliate" className={itemBase}>
                {({ isActive }) => (
                  <>
                    <span className={iconClass(isActive)}>
                      <FaUsers className={iconColor(isActive)} />
                    </span>
                    <span className="text-[11px] font-extrabold text-white/95">
                      {t.affiliates}
                    </span>
                  </>
                )}
              </NavLink>

              {/* Promotions */}
              <NavLink to="/promotions" className={itemBase}>
                {({ isActive }) => (
                  <>
                    <span className={iconClass(isActive)}>
                      <FaTags className={iconColor(isActive)} />
                    </span>
                    <span className="text-[11px] font-extrabold text-white/95">
                      {t.promotions}
                    </span>
                  </>
                )}
              </NavLink>

              {/* Home */}
              <NavLink to="/" end className={itemBase}>
                {({ isActive }) => (
                  <>
                    <span className={iconClass(isActive)}>
                      <FaHome className={iconColor(isActive)} />
                    </span>
                    <span className="text-[11px] font-extrabold text-white/95">
                      {t.home}
                    </span>
                  </>
                )}
              </NavLink>

              {/* Betting */}
              <NavLink to="/betting-pass" className={itemBase}>
                {({ isActive }) => (
                  <>
                    <span className={iconClass(isActive)}>
                      <FaChartBar className={iconColor(isActive)} />
                    </span>
                    <span className="text-[11px] font-extrabold text-white/95">
                      {t.bettingPass}
                    </span>
                  </>
                )}
              </NavLink>

              {/* Rewards */}
              <NavLink to="/rewards" className={itemBase}>
                {({ isActive }) => (
                  <>
                    <span className={iconClass(isActive)}>
                      <FaGift className={iconColor(isActive)} />
                    </span>
                    <span className="text-[11px] font-extrabold text-white/95">
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
