import React from "react";
import Navber from "../components/Navber/Navber";
import { Outlet } from "react-router";
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";
import MenuItems from "../components/MenuItems/MenuItems";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
import DownloadHeader from "../components/DownloadHeader/DownloadHeader";
import FavIconAndLogo from "../components/FavIconAndLogo/FavIconAndLogo";

const RootLayout = () => {
  return (
    <div>
      <DownloadHeader />
      <Navber />
      <MenuItems />
      <FavIconAndLogo />
      <FloatingSocial />
      <BottomNavbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default RootLayout;
