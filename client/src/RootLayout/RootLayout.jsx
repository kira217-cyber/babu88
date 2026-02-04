import React from "react";
import Navber from "../components/Navber/Navber";
import { Outlet } from "react-router";
import Footer from "../components/Footer/Footer";
import FloatingSocial from "../components/FloatingSocial/FloatingSocial";
import MenuItems from "../components/MenuItems/MenuItems";

const RootLayout = () => {
  return (
    <div>
      <Navber />
      <MenuItems />
      <FloatingSocial />
      <Outlet />
      <Footer />
    </div>
  );
};

export default RootLayout;
