import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const fetchHotGamesColor = async () => {
  const { data } = await api.get("/api/hotgames-color");
  return data;
};

const fetchHotGames = async () => {
  const { data } = await api.get("/api/public/hot-games?limit=15");
  return data?.data || [];
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

const HOT_ICON = "https://babu88.gold/static/image/other/hot-icon.png";

const HotBadge = () => (
  <img
    src={HOT_ICON}
    alt="HOT"
    className="
      absolute top-0 right-2
      w-10 h-10
      drop-shadow-lg
      pointer-events-none
    "
  />
);

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=60";

const HotGames = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  // ✅ only token check
  const token = useSelector((state) => state.auth.token);

  // 🎨 UI config from DB (unchanged)
  const { data: colorDoc } = useQuery({
    queryKey: ["hotgames-color"],
    queryFn: fetchHotGamesColor,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  // 🔥 Hot games from DB
  const { data: games = [], isLoading } = useQuery({
    queryKey: ["hot-games-15"],
    queryFn: fetchHotGames,
    staleTime: 1000 * 30,
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

  const handlePlay = (g) => {
    const gameId = g?.gameId;
    if (!gameId) return;

    // ✅ only login required
    if (!token) {
      toast.error(isBangla ? "খেলতে লগইন করুন" : "Please login to play");
      navigate("/login");
      return;
    }

    // ✅ go play
    navigate(`/playgame/${gameId}`);
  };

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

        {/* loading */}
        {isLoading ? (
          <div className="mt-6 text-center text-black/60 font-bold">
            Loading...
          </div>
        ) : games.length === 0 ? (
          <div className="mt-6 text-center text-black/60 font-bold">
            {isBangla ? "কোন হট গেম নেই" : "No hot games found"}
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-5 gap-x-6 gap-y-8">
            {games.map((g) => {
              const title = g.gameName || g.title || "Game";
              const provider = g.providerName || g.providerId || "";

              const img =
                g.image && String(g.image).trim()
                  ? `${import.meta.env.VITE_API_URL}${g.image}`
                  : "";

              return (
                <div key={g._id} className="group">
                  <button
                    type="button"
                    onClick={() => handlePlay(g)}
                    className="relative w-full overflow-hidden focus:outline-none"
                    title={title}
                    style={{
                      borderRadius: ui.cardRadius,
                      backgroundColor: hexToRgba(ui.cardBg, ui.cardBgOpacity),
                      boxShadow: ui.cardShadow.replaceAll("_", " "),
                    }}
                  >
                    <div className="aspect-[16/9] w-full">
                      <img
                        src={img}
                        alt={title}
                        className="h-48 w-full object-cover transition duration-300"
                        loading="lazy"
                        // onError={(e) => {
                        //   e.currentTarget.src = FALLBACK_IMG;
                        // }}
                      />
                    </div>

                    {/* Hover scale */}
                    <style>{`
                      .group:hover img { transform: scale(${ui.imgHoverScale}); }
                    `}</style>

                    {/* HOT badge */}
                    <HotBadge />

                    {/* overlay */}
                    <div
                      className="
                        absolute inset-0
                        opacity-0 group-hover:opacity-100
                        transition duration-200
                        flex items-center justify-center
                      "
                      style={{
                        backgroundColor: hexToRgba(
                          ui.overlayBg,
                          ui.overlayOpacity,
                        ),
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
                      {title}
                    </p>

                    <p
                      className="text-center uppercase tracking-wide mt-1 line-clamp-1"
                      style={{
                        color: hexToRgba(ui.providerText, ui.providerOpacity),
                        fontSize: ui.providerSize,
                        fontWeight: ui.providerWeight,
                      }}
                    >
                      {provider}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default HotGames;
