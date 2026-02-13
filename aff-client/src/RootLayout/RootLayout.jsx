import React from "react";
import Navber from "../components/Navber/Navber";
import { Outlet } from "react-router";
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";
import AffSiteMeta from "../components/AffSiteMeta/AffSiteMeta";

const RootLayout = () => {
  return (
    <div>
      <AffSiteMeta />
      <Navber />
      <FloatingSocial />
      <Outlet />
      <Footer />
    </div>
  );
};

export default RootLayout;
