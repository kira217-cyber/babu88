import React, { useState } from "react";

// Import all affiliate color controllers
import AffNavbarColorController from "../../components/AffNavbarColorController/AffNavbarColorController";
import AffFooterColorController from "../../components/AffFooterColorController/AffFooterColorController";
import AffRegisterColorController from "../../components/AffRegisterColorController/AffRegisterColorController";
import AffLoginColorController from "../../components/AffLoginColorController/AffLoginColorController";
import AffCommissionColorController from "../../components/AffCommissionColorController/AffCommissionColorController";
import AffBottomNavbarColorController from "../../components/AffBottomNavbarColorController/AffBottomNavbarColorController";
import AffAgentColorController from "../../components/AffAgentColorController/AffAgentColorController";
import WhyUsColorController from "../../components/WhyUsColorController/WhyUsColorController";
import AffNoticeColorController from "../../components/AffNoticeColorController/AffNoticeColorController";
import AffSliderColorController from "../../components/AffSliderColorController/AffSliderColorController";

const controllers = [
  {
    id: "aff-navbar",
    name: "Affiliate Navbar",
    component: <AffNavbarColorController />,
  },
  {
    id: "aff-footer",
    name: "Affiliate Footer",
    component: <AffFooterColorController />,
  },
  {
    id: "aff-register",
    name: "Affiliate Register Page",
    component: <AffRegisterColorController />,
  },
  {
    id: "aff-login",
    name: "Affiliate Login Page",
    component: <AffLoginColorController />,
  },
  {
    id: "aff-commission",
    name: "Commission Display",
    component: <AffCommissionColorController />,
  },
  {
    id: "aff-bottom-navbar",
    name: "Affiliate Bottom Navbar",
    component: <AffBottomNavbarColorController />,
  },
  {
    id: "aff-agent",
    name: "Agent Section",
    component: <AffAgentColorController />,
  },
  { id: "why-us", name: "Why Us Section", component: <WhyUsColorController /> },
  {
    id: "aff-notice",
    name: "Affiliate Notice",
    component: <AffNoticeColorController />,
  },
  {
    id: "aff-slider",
    name: "Affiliate Slider/Banner",
    component: <AffSliderColorController />,
  },
];

const ColorControllerAffiliate = () => {
  const [activeSection, setActiveSection] = useState(null);

  const toggleSection = (id) => {
    setActiveSection(activeSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black text-white">
      {/* Header */}
      <div className="p-6 lg:p-8 border-b border-yellow-700/40 bg-gradient-to-r from-black/70 via-yellow-950/30 to-black/70 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-yellow-400">
          Affiliate Color Controller
        </h1>
        <p className="mt-2 text-yellow-200/80">
          Customize colors and styles for different sections of the affiliate
          site
        </p>
      </div>

      <div className="p-5 md:p-8 lg:p-10">
        {/* Buttons / Cards Grid */}
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
                  overflow-hidden
                  ${
                    isActive
                      ? "bg-gradient-to-r from-yellow-600/90 to-amber-600/90 text-black shadow-lg shadow-yellow-700/40 scale-[1.02]"
                      : "bg-black/40 hover:bg-yellow-950/40 text-yellow-100 hover:text-white"
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

                {/* Shine / gradient overlay on hover & active */}
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

        {/* Content Area – shown when a section is selected */}
        <div className="mt-6">
          {activeSection ? (
            <div className="p-2 md:p-4 lg:p-6 bg-black/30 rounded-xl border border-yellow-800/30">
              {controllers.find((c) => c.id === activeSection)?.component}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 md:py-24">
              <div className="w-20 h-20 mb-6 opacity-80">
                <svg
                  className="w-16 h-16 md:w-20 md:h-20 text-yellow-400/70"
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
                Select an Affiliate Section
              </h2>
              <p className="text-yellow-200/70 text-center max-w-md">
                Click any button above to start customizing colors and
                appearance for that part of the affiliate interface.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorControllerAffiliate;
