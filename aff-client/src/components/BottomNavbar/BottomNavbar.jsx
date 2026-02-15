import React, { useMemo } from "react";
import { NavLink } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

const BottomNavbar = () => {
  const { isBangla } = useLanguage();

  const t = useMemo(() => {
    return {
      login: isBangla ? "লগইন" : "Login",
      register: isBangla ? "রেজিস্টার" : "Register",
    };
  }, [isBangla]);

  // ✅ config
  const { data: cfg } = useQuery({
    queryKey: ["aff-bottom-navbar-color"],
    queryFn: async () => (await api.get("/api/aff-bottom-navbar-color")).data,
    staleTime: 60_000,
    retry: 1,
  });

  const c = cfg || {};
  const cssVars = {
    "--bn-bar": c.barBg || "#2b2b2b",
    "--bn-border": c.barBorderTop || "rgba(255,255,255,0.10)",

    "--bn-pad-x": `${c.padX ?? 12}px`,
    "--bn-pad-y": `${c.padY ?? 8}px`,
    "--bn-gap": `${c.gap ?? 12}px`,

    "--bn-text-size": `${c.btnTextSize ?? 14}px`,
    "--bn-radius": `${c.btnRadius ?? 6}px`,
    "--bn-btn-py": `${c.btnPadY ?? 12}px`,

    "--bn-login-bg": c.loginBg || "#3f3f3f",
    "--bn-login-hover": c.loginHoverBg || "#4b4b4b",
    "--bn-login-text": c.loginText || "#ffffff",
    "--bn-login-ring": c.loginActiveRing || "#f5b400",
    "--bn-login-ringw": `${c.loginActiveRingWidth ?? 2}px`,

    "--bn-reg-bg": c.registerBg || "#f5b400",
    "--bn-reg-hover": c.registerHoverBg || "#e2a800",
    "--bn-reg-text": c.registerText || "#000000",
    "--bn-reg-ring": c.registerActiveRing || "rgba(0,0,0,0.40)",
    "--bn-reg-ringw": `${c.registerActiveRingWidth ?? 2}px`,
  };

  const baseBtn = "flex-1 text-center font-extrabold transition cursor-pointer";

  const ringStyle = (color, w) => ({
    boxShadow: `0 0 0 ${w} ${color}`,
  });

  return (
    <div
      style={cssVars}
      className="fixed bottom-0 left-0 w-full z-50 md:hidden"
    >
      <div
        className="w-full border-t"
        style={{ background: "var(--bn-bar)", borderColor: "var(--bn-border)" }}
      >
        <div
          className="flex"
          style={{
            paddingLeft: "var(--bn-pad-x)",
            paddingRight: "var(--bn-pad-x)",
            paddingTop: "var(--bn-pad-y)",
            paddingBottom: "var(--bn-pad-y)",
            gap: "var(--bn-gap)",
          }}
        >
          {/* Login */}
          <NavLink
            to="/login"
            className={({ isActive }) => `${baseBtn}`}
            style={({ isActive }) => ({
              background: "var(--bn-login-bg)",
              color: "var(--bn-login-text)",
              borderRadius: "var(--bn-radius)",
              fontSize: "var(--bn-text-size)",
              paddingTop: "var(--bn-btn-py)",
              paddingBottom: "var(--bn-btn-py)",
              ...(isActive
                ? ringStyle("var(--bn-login-ring)", "var(--bn-login-ringw)")
                : {}),
            })}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bn-login-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--bn-login-bg)")
            }
          >
            {t.login}
          </NavLink>

          {/* Register */}
          <NavLink
            to="/register"
            className={({ isActive }) => `${baseBtn}`}
            style={({ isActive }) => ({
              background: "var(--bn-reg-bg)",
              color: "var(--bn-reg-text)",
              borderRadius: "var(--bn-radius)",
              fontSize: "var(--bn-text-size)",
              paddingTop: "var(--bn-btn-py)",
              paddingBottom: "var(--bn-btn-py)",
              ...(isActive
                ? ringStyle("var(--bn-reg-ring)", "var(--bn-reg-ringw)")
                : {}),
            })}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bn-reg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--bn-reg-bg)")
            }
          >
            {t.register}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default BottomNavbar;
