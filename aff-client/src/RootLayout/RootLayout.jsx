import React from "react";
import Navber from "../components/Navber/Navber";
import { Outlet } from "react-router";
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";
import AffSiteMeta from "../components/AffSiteMeta/AffSiteMeta";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";

const RootLayout = () => {
  return (
    <div>
      <AffSiteMeta />
      <Navber />
      <FloatingSocial />
      <Outlet />
      <BottomNavbar />
      <Footer />
    </div>
  );
};

export default RootLayout;
