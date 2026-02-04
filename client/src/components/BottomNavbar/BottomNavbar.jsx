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
    "flex-1 text-center py-4 font-extrabold text-md transition cursor-pointer";

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
      <div className="flex items-center">
        {/* Login Button */}
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `${baseBtn} bg-[#FFCE01] text-black ${
              isActive ? "" : ""
            }`
          }
        >
          {t.login}
        </NavLink>

        {/* Register Button */}
        <NavLink
          to="/register"
          className={({ isActive }) =>
            `${baseBtn} bg-[#0066D1] text-white ${
              isActive ? " " : " "
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
