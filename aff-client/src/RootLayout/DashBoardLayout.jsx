import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import AffSiteMeta from "../components/AffSiteMeta/AffSiteMeta";

const DashBoardLayout = () => {
  return (
    <div>
      <AffSiteMeta />
      <Sidebar />
    </div>
  );
};

export default DashBoardLayout;
