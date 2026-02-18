import React, { useMemo } from "react";
import { useLocation } from "react-router";
import MobileRegister from "./MobileRegister";
import DesktopRegister from "./DesktopRegister";

const Register = () => {
  const location = useLocation();

  const refCode = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return (sp.get("ref") || "").trim();
  }, [location.search]);

  return (
    <div>
      <MobileRegister refCode={refCode} />
      <DesktopRegister refCode={refCode} />
    </div>
  );
};

export default Register;
