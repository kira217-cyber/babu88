import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

import Notice from "../../components/Notice/Notice";
import Slider from "../../components/Slider/Slider";
import Agent from "../../components/Agent/Agent";
import WhyUs from "../../components/WhyUs/WhyUs";
import Commission from "../../components/Commission/Commission";
import MenuItems from "../../components/MenuItems/MenuItems";
import HotGames from "../../components/HotGames/HotGames";
import Banner from "../../components/Banner/Banner";
import LiveGames from "../../components/LiveGames/LiveGames";
import DownloadBanner from "../../components/DownloadBanner/DownloadBanner";
import TwoBanner from "../../components/TwoBanner/TwoBanner";
import SingleBanner from "../../components/SingleBanner/SingleBanner";
import GameCategory from "../../components/GameCategory/GameCategory";
import Balance from "../../components/Balance/Balance";

import {
  selectIsAuthenticated,
  selectAuth,
} from "../../features/auth/authSelectors";

const Home = () => {
  const navigate = useNavigate();

  // ✅ redux auth
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { user } = useSelector(selectAuth);

  return (
    <div>
      <Slider />
      <Notice />

      {/* ✅ Mobile + Logged In only Balance bar */}
      {isAuthenticated && (
        <Balance
          balance={user?.balance ?? 0}
          onDeposit={() => navigate("/deposit")}
          onWithdraw={() => navigate("/withdraw")}
          onAccount={() => navigate("/profile")}
        />
      )}

      {/* Mobile only category */}
      <div className="md:hidden">
        <GameCategory />
      </div>

      <SingleBanner />
      <HotGames />
      <Banner />
      <LiveGames />
      <TwoBanner />
      <DownloadBanner />

      {/*
      <Agent />
      <Commission />
      <WhyUs />
      */}
    </div>
  );
};

export default Home;
