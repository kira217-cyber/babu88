import React, { useState } from "react";

// Import all your controllers
import NavbarColorController from "../../components/NavbarColorController/NavbarColorController";
import MenuItemsColorController from "../../components/MenuItemsColorController/MenuItemsColorController";
import BottomNavbarColorController from "../../components/BottomNavbarColorController/BottomNavbarColorController";
import FooterColorController from "../../components/FooterColorController/FooterColorController";
import LiveGamesColorController from "../../components/LiveGamesColorController/LiveGamesColorController";
import GameCategoryColorController from "../../components/GameCategoryColorController/GameCategoryColorController";
import PromotionsColorController from "../../components/PromotionsColorController/PromotionsColorController";
import DownloadHeaderColorController from "../../components/DownloadHeaderColorController/DownloadHeaderColorController";
import NoticeColorController from "../../components/NoticeColorController/NoticeColorController";
import HotGamesColorController from "../../components/HotGamesColorController/HotGamesColorController";
import TwoBannerColorController from "../../components/TwoBannerColorController/TwoBannerColorController";
import DownloadBannerColorController from "../../components/DownloadBannerColorController/DownloadBannerColorController";
import BalanceColorController from "../../components/BalanceColorController/BalanceColorController";
import LoginColorController from "../../components/LoginColorController/LoginColorController";
import PromotionModalController from "../../components/PromotionModalController/PromotionModalController";
import RegisterController from "../../components/RegisterController/RegisterController";

const controllers = [
  { id: "navbar", name: "Navbar", component: <NavbarColorController /> },
  { id: "menu", name: "Menu Items", component: <MenuItemsColorController /> },
  {
    id: "bottom-navbar",
    name: "Bottom Navbar",
    component: <BottomNavbarColorController />,
  },
  { id: "footer", name: "Footer", component: <FooterColorController /> },
  {
    id: "live-games",
    name: "Live Games",
    component: <LiveGamesColorController />,
  },
  {
    id: "game-category",
    name: "Game Categories",
    component: <GameCategoryColorController />,
  },
  {
    id: "promotions",
    name: "Promotions",
    component: <PromotionsColorController />,
  },
  {
    id: "download-header",
    name: "Download Header",
    component: <DownloadHeaderColorController />,
  },
  { id: "notice", name: "Notice", component: <NoticeColorController /> },
  {
    id: "hot-games",
    name: "Hot Games",
    component: <HotGamesColorController />,
  },
  {
    id: "two-banner",
    name: "Two Banner",
    component: <TwoBannerColorController />,
  },
  {
    id: "download-banner",
    name: "Download Banner",
    component: <DownloadBannerColorController />,
  },
  {
    id: "balance",
    name: "Balance Display",
    component: <BalanceColorController />,
  },
  { id: "login", name: "Login Page", component: <LoginColorController /> },
  {
    id: "promotion-modal",
    name: "Promotion Modal",
    component: <PromotionModalController />,
  },
  { id: "register", name: "Register Page", component: <RegisterController /> },
];

const ColorControllerClient = () => {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (id) => {
    setActiveSection(activeSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white">
      {/* Header */}
      <div className="p-6 lg:p-8 border-b border-yellow-700/40 bg-gradient-to-r from-black/70 via-yellow-950/30 to-black/70 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-yellow-400">
          Client Color Controller
        </h1>
        <p className="mt-2 text-yellow-200/80">
          Customize colors for different sections of the client site
        </p>
      </div>

      <div className="p-5 md:p-8 lg:p-10">
        {/* Buttons Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5 mb-10">
          {controllers.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => toggleSection(item.id)}
                className={`
                  group relative px-5 py-4 md:py-5 rounded-xl text-left font-medium transition-all duration-300
                  border border-yellow-700/30 hover:border-yellow-600/60
                  ${
                    isActive
                      ? "bg-gradient-to-r cursor-pointer from-yellow-600/90 to-amber-600/90 text-black shadow-lg shadow-yellow-700/40 scale-[1.02]"
                      : "bg-black/40 cursor-pointer hover:bg-yellow-950/40 text-yellow-100 hover:text-white"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base md:text-lg">{item.name}</span>
                  {isActive && (
                    <span className="text-xs md:text-sm opacity-80 bg-black/30 px-2.5 py-1 rounded-full">
                      Close
                    </span>
                  )}
                </div>

                {/* Subtle shine effect on hover/active */}
                <div
                  className={`
                    absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 
                    group-hover:opacity-30 transition-opacity duration-500 pointer-events-none
                    ${isActive ? "opacity-40" : ""}
                  `}
                />
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div >
          {activeSection ? (
            <div className="p-2">
              {controllers.find((c) => c.id === activeSection)?.component}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 ">
                <svg
                  className="w-10 h-10 text-yellow-400/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h14a2 2 0 012 2v12a4 4 0 01-4 4h-2m-6 0h6"
                  />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-yellow-300 mb-3">
                Select a Section
              </h2>
              <p className="text-yellow-200/70 max-w-md">
                Click any button above to start editing colors and styles for
                that part of the client interface.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorControllerClient;
