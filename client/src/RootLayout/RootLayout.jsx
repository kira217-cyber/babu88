import React, { useEffect } from "react";
import Navber from "../components/Navber/Navber";
import { Outlet, useLocation } from "react-router"; // useLocation import kora holo
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";
import MenuItems from "../components/MenuItems/MenuItems";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
import DownloadHeader from "../components/DownloadHeader/DownloadHeader";
import FavIconAndLogo from "../components/FavIconAndLogo/FavIconAndLogo";
import PromotionModal from "../components/PromotionModal/PromotionModal";
import ReactPixel from 'react-facebook-pixel'; // ReactPixel import kora holo

const RootLayout = () => {
  const location = useLocation();

  useEffect(() => {
    // User jokhon-i kono noton page layout-e ashbe, automatic dynamic track path trigger hobe
    ReactPixel.pageView();
  }, [location]); // location array specify koray dynamic page switch detect korbe

  return (
    <div>
      <DownloadHeader />
      <Navber />
      <PromotionModal navigateTo="/promotions" />
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