import React from "react";
import Navber from "../components/Navber/Navber";
import { Outlet } from "react-router";
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";
import MenuItems from "../components/MenuItems/MenuItems";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
import DownloadHeader from "../components/DownloadHeader/DownloadHeader";

const RootLayout = () => {
  return (
    <div>
      <DownloadHeader />
      <Navber />
      <MenuItems />
      {/* <FloatingSocial /> */}
      <BottomNavbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default RootLayout;
