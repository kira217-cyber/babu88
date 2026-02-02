import React from "react";
import Notice from "../../components/Notice/Notice";
import Slider from "../../components/Slider/Slider";
import Agent from "../../components/Agent/Agent";
import WhyUs from "../../components/WhyUs/WhyUs";
import Commission from "../../components/Commission/Commission";
import BottomNavbar from "../../components/BottomNavbar/BottomNavbar";

const Home = () => {
  return (
    <div>
      <Notice />
      <Slider />
      <Agent />
      <Commission />
      <WhyUs />
      <BottomNavbar />
    </div>
  );
};

export default Home;
