import React from "react";
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

const Home = () => {
  return (
    <div>
      <Slider />
      <Notice />
      <SingleBanner />
      <HotGames />
      <Banner />
      <LiveGames />
      <TwoBanner />
      <DownloadBanner />
      {/* <Agent />
      <Commission />
      <WhyUs /> */}
    </div>
  );
};

export default Home;
