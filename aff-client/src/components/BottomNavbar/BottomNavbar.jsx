import React, { useMemo } from "react";
import { NavLink } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const BottomNavbar = () => {
  const { isBangla } = useLanguage();

  const t = useMemo(() => {
    return {
      login: isBangla ? "লগইন" : "Login",
      register: isBangla ? "রেজিস্টার" : "Register",
    };
  }, [isBangla]);

  const baseBtn =
    "flex-1 text-center py-3 font-extrabold text-sm rounded-md transition cursor-pointer";

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#2b2b2b] border-t border-white/10 z-50 md:hidden">
      <div className="px-3 py-2 flex gap-3">
        {/* Login Button */}
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `${baseBtn} bg-[#3f3f3f] text-white hover:bg-[#4b4b4b] ${
              isActive ? "ring-2 ring-[#f5b400]" : ""
            }`
          }
        >
          {t.login}
        </NavLink>

        {/* Register Button */}
        <NavLink
          to="/register"
          className={({ isActive }) =>
            `${baseBtn} bg-[#f5b400] text-black hover:bg-[#e2a800] ${
              isActive ? "ring-2 ring-black/40" : ""
            }`
          }
        >
          {t.register}
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNavbar;
