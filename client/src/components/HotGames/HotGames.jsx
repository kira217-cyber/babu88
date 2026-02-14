import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

const fetchHotGamesColor = async () => {
  const { data } = await api.get("/api/hotgames-color");
  return data;
};

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== "string") return `rgba(0,0,0,${alpha})`;
  if (!hex.startsWith("#")) return hex;
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `rgba(0,0,0,${alpha})`;
};

const HotBadge = ({ ui }) => (
  <span
    className="absolute top-2 right-2 px-2 py-[2px] rounded-full shadow"
    style={{
      backgroundColor: ui.hotBg,
      color: ui.hotText,
      fontSize: ui.hotTextSize,
      fontWeight: ui.hotWeight,
    }}
  >
    HOT
  </span>
);

const HotGames = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const { data: colorDoc } = useQuery({
    queryKey: ["hotgames-color"],
    queryFn: fetchHotGamesColor,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const ui = useMemo(() => {
    const d = colorDoc || {};
    return {
      titleColor: d.titleColor || "#000000",
      titleSize: d.titleSize ?? 28,
      titleWeight: d.titleWeight ?? 800,

      cardBg: d.cardBg || "#000000",
      cardBgOpacity: d.cardBgOpacity ?? 0.05,
      cardRadius: d.cardRadius ?? 12,
      cardShadow: d.cardShadow || "0_10px_25px_rgba(0,0,0,0.12)",

      imgHoverScale: d.imgHoverScale ?? 1.04,

      overlayBg: d.overlayBg || "#000000",
      overlayOpacity: d.overlayOpacity ?? 0.25,

      playPillBg: d.playPillBg || "#ffffff",
      playPillBgOpacity: d.playPillBgOpacity ?? 0.1,
      playPillBorder: d.playPillBorder || "#ffffff",
      playPillBorderOpacity: d.playPillBorderOpacity ?? 0.25,
      playTextColor: d.playTextColor || "#ffffff",
      playTextSize: d.playTextSize ?? 14,
      playTextWeight: d.playTextWeight ?? 800,

      hotBg: d.hotBg || "#ff3b30",
      hotText: d.hotText || "#ffffff",
      hotTextSize: d.hotTextSize ?? 10,
      hotWeight: d.hotWeight ?? 800,

      gameTitleBg: d.gameTitleBg || "#fbbf24",
      gameTitleText: d.gameTitleText || "#000000",
      gameTitleSize: d.gameTitleSize ?? 15,
      gameTitleWeight: d.gameTitleWeight ?? 800,

      providerText: d.providerText || "#000000",
      providerOpacity: d.providerOpacity ?? 0.6,
      providerSize: d.providerSize ?? 11,
      providerWeight: d.providerWeight ?? 800,
    };
  }, [colorDoc]);

  // 🔁 demo games (unchanged)
  const games = useMemo(
    () => [
      {
        id: "bb88-super-ace",
        title: "BB88 Super Ace",
        provider: "JILI",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/Cg4lgL5AQ5VS2uwhKGamGKwqSPbK7Xcj99bSWTno.jpg",
        hot: true,
      },
      {
        id: "aviator-1",
        title: "Aviator",
        provider: "AVIATOR STUDIO",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/1JbjzqcccNub15FEa8NFG8nBQbSqeO4Lzo3t33ad.jpg",
        hot: true,
      },
      {
        id: "fortune-gems-500",
        title: "Fortune Gems 500",
        provider: "JILI",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/f2nWuCXKcdgH6K7sC8dGxzX8ALgAqvjPLnCaI9sm.jpg",
        hot: true,
      },
      {
        id: "aviator-2",
        title: "Aviator",
        provider: "SPRIBE",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/hRWrzomQ5kEifPSkA7bYLWT7fahUHvakaLyvA4th.jpg",
        hot: true,
      },
      {
        id: "super-ace",
        title: "Super Ace",
        provider: "JILI",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/ad5CfULwpWYJ0qyEtT3a8Djc5eCghQwroEo1vLrv.jpg",
        hot: true,
      },
      {
        id: "crash-cricket",
        title: "BB88 Crash Cricket",
        provider: "JILI",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/9C93WgGFt5Hu2d4Zy8Oi4ZOTN4AfwpZ5YUFF1VRj.jpg",
        hot: true,
      },
      {
        id: "crazy-time",
        title: "Crazy Time",
        provider: "EVOLUTION GAMING",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/XKMsslvB0bgiBJ41meWZH3mO02J0ysgOdnE8WMc5.jpg",
        hot: true,
      },
      {
        id: "fortune-gems-2",
        title: "Fortune Gems 2",
        provider: "JILI",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/xCfRmJP2Fm1Fw9VEUHFoCtNaBpfTyXIYdr5Osuzl.png",
        hot: true,
      },
      {
        id: "7up7down",
        title: "7up7down",
        provider: "JILI",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/aCKPJmhoUiyOrQmLIZWNLZo9PfkCRLmUNHwOGHia.png",
        hot: true,
      },
      {
        id: "funky-time",
        title: "Evo Funky Time",
        provider: "EVOLUTION GAMING",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/xCfRmJP2Fm1Fw9VEUHFoCtNaBpfTyXIYdr5Osuzl.png",
        hot: true,
      },
      {
        id: "boxing-king",
        title: "Boxing King",
        provider: "JILI",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/aNJOerVVQkubX6fla08q94flSi1TJB50WTaFNpVC.png",
        hot: true,
      },
      {
        id: "money-coming",
        title: "Money Coming",
        provider: "JILI",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/2DBG4VFxCy7icorMGJ3dvQVNBjKOzpcbDfVlBt2R.png",
        hot: true,
      },
      {
        id: "super-ace-deluxe",
        title: "Super Ace Deluxe",
        provider: "JILI",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/DtP4ZtTTSFMSTUxfRBlChuvPSaZ7F6AUlyCPF9HQ.png",
        hot: true,
      },
      {
        id: "wild-bounty-showdown",
        title: "Wild Bounty Showdown",
        provider: "PG SOFT",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/hRJKCIGfsKom04Ok44tFzyyHLxOTDSPXvPTQAvx6.jpg",
        hot: true,
      },
      {
        id: "nft-aviatrix",
        title: "NFT Aviatrix",
        provider: "AVIATRIX",
        img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/uZeMqebF1pY4hyhI09nNJl8JPUdObpTZK8TNKRmn.png",
        hot: true,
      },
    ],
    [],
  );

  return (
    <section className="hidden lg:block w-full">
      <div className="mx-auto max-w-[1500px] px-2 py-4 lg:px-0">
        <div className="flex items-end justify-between">
          <h2
            className="tracking-tight"
            style={{
              fontSize: ui.titleSize,
              fontWeight: ui.titleWeight,
              color: ui.titleColor,
            }}
          >
            {isBangla ? "হট গেমস" : "Hot Games"}
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-5 gap-x-6 gap-y-8">
          {games.map((g) => (
            <div key={g.id} className="group">
              <button
                type="button"
                onClick={() => navigate(`/play/${g.id}`)}
                className="relative w-full overflow-hidden focus:outline-none"
                title={g.title}
                style={{
                  borderRadius: ui.cardRadius,
                  backgroundColor: hexToRgba(ui.cardBg, ui.cardBgOpacity),
                  boxShadow: ui.cardShadow.includes("rgba(")
                    ? ui.cardShadow.replaceAll("_", " ")
                    : ui.cardShadow.replaceAll("_", " "),
                }}
              >
                <div className="aspect-[16/9] w-full">
                  <img
                    src={g.img}
                    alt={g.title}
                    className="h-48 w-full object-cover transition duration-300"
                    style={{
                      transform: undefined,
                    }}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=60";
                    }}
                  />
                </div>

                {/* Hover scale without changing structure */}
                <style>{`
                  .group:hover img { transform: scale(${ui.imgHoverScale}); }
                `}</style>

                {g.hot ? <HotBadge ui={ui} /> : null}

                <div
                  className="
                    absolute inset-0
                    opacity-0 group-hover:opacity-100
                    transition duration-200
                    flex items-center justify-center
                  "
                  style={{
                    backgroundColor: hexToRgba(ui.overlayBg, ui.overlayOpacity),
                  }}
                >
                  <div
                    className="
                      px-5 py-2
                      rounded-full
                      border cursor-pointer
                      backdrop-blur-sm
                      tracking-widest
                    "
                    style={{
                      backgroundColor: hexToRgba(
                        ui.playPillBg,
                        ui.playPillBgOpacity,
                      ),
                      borderColor: hexToRgba(
                        ui.playPillBorder,
                        ui.playPillBorderOpacity,
                      ),
                      color: ui.playTextColor,
                      fontWeight: ui.playTextWeight,
                      fontSize: ui.playTextSize,
                    }}
                  >
                    PLAY
                  </div>
                </div>
              </button>

              <div className="mt-2">
                <p
                  className="text-center leading-snug line-clamp-1"
                  style={{
                    backgroundColor: ui.gameTitleBg,
                    color: ui.gameTitleText,
                    fontSize: ui.gameTitleSize,
                    fontWeight: ui.gameTitleWeight,
                  }}
                >
                  {g.title}
                </p>

                <p
                  className="text-center uppercase tracking-wide mt-1"
                  style={{
                    color: hexToRgba(ui.providerText, ui.providerOpacity),
                    fontSize: ui.providerSize,
                    fontWeight: ui.providerWeight,
                  }}
                >
                  {g.provider}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotGames;
