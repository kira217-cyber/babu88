import React, { useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const MASTER_API_URL = import.meta.env.VITE_MASTER_API_URL;

const fetchHotGamesColor = async () => {
  const { data } = await api.get("/api/hotgames-color");
  return data;
};

const getSavedApiKey = async () => {
  const res = await api.get("/api/admin/game-api-key");
  const setting = res?.data?.data?.setting;

  if (!setting?.apiKey || !setting?.isActive || !setting?.isVerified) {
    return "";
  }

  return setting.apiKey;
};

const fetchHotGames = async () => {
  try {
    const apiKey = await getSavedApiKey();

    if (!apiKey || !MASTER_API_URL) {
      return [];
    }

    const { data } = await axios.get(
      `${MASTER_API_URL}/api/white-label/hot-games`,
      {
        params: { limit: 15 },
        headers: {
          "x-api-key": apiKey,
        },
      },
    );

    return data?.data || [];
  } catch (error) {
    console.error("White label hot games fetch failed:", error);
    return [];
  }
};

const masterFileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;

  const base = String(MASTER_API_URL || "").replace(/\/+$/, "");
  const cleanPath = String(path).startsWith("/") ? path : `/${path}`;

  return `${base}${cleanPath}`;
};

const getGameImage = (game) => {
  if (game?.image) return masterFileUrl(game.image);
  if (game?.oracleImage) return game.oracleImage;
  if (game?.oracleImages?.thumbnail) return game.oracleImages.thumbnail;
  if (game?.oracleImages?.height) return game.oracleImages.height;
  if (game?.oracleImages?.original) return game.oracleImages.original;
  return "/no-image.png";
};

const getPlayableGameId = (game) => {
  return game?.game_uid || game?.gameUId || game?.gameId || game?.id || "";
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
    className="pointer-events-none absolute right-2 top-0 h-10 w-10 drop-shadow-lg"
  />
);

const HotGames = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();
  const token = useSelector((state) => state.auth.token);

  const { data: colorDoc } = useQuery({
    queryKey: ["hotgames-color"],
    queryFn: fetchHotGamesColor,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["white-label-hot-games-15"],
    queryFn: fetchHotGames,
    staleTime: 1000 * 30,
    retry: false,
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

      cardBorderColor: d.cardBorderColor || "#4B03DF",
      cardBorderWidth: d.cardBorderWidth ?? 3,

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

      gameTitleBg: d.gameTitleBg || "#fbbf24",
      gameTitleText: d.gameTitleText || "#000000",
      gameTitleSize: d.gameTitleSize ?? 15,
      gameTitleWeight: d.gameTitleWeight ?? 800,

      providerBg: d.providerBg || "#4B03DF",
      providerBgOpacity: d.providerBgOpacity ?? 1,
      providerText: d.providerText || "#ffffff",
      providerOpacity: d.providerOpacity ?? 1,
      providerSize: d.providerSize ?? 11,
      providerWeight: d.providerWeight ?? 800,
    };
  }, [colorDoc]);

  const handlePlay = (g) => {
    const gameId = getPlayableGameId(g);

    if (!gameId) {
      toast.error(isBangla ? "গেম আইডি পাওয়া যায়নি" : "Game id not found");
      return;
    }

    if (!token) {
      toast.error(isBangla ? "খেলতে লগইন করুন" : "Please login to play");
      navigate("/login");
      return;
    }

    navigate(`/playgame/${gameId}`, {
      state: {
        game: g,
        game_uid: gameId,
      },
    });
  };

  return (
    <section className="hidden w-full lg:block">
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

        {isLoading ? (
          <div className="mt-6 text-center font-bold text-black/60">
            Loading...
          </div>
        ) : games.length === 0 ? (
          <div className="mt-6 text-center font-bold text-black/60">
            {isBangla ? "কোন হট গেম নেই" : "No hot games found"}
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-7 gap-x-6 gap-y-8">
            {games.map((g) => {
              const gameId = getPlayableGameId(g);
              const title = g.gameName || g.name || gameId || "Game";
              const provider = g.provider || g.providerName || "";
              const img = getGameImage(g);

              return (
                <div key={g._id || gameId} className="group">
                  <button
                    type="button"
                    onClick={() => handlePlay(g)}
                    className="relative w-48 overflow-hidden focus:outline-none rounded-lg"
                    title={title}
                    style={{
                      borderRadius: ui.cardRadius,
                      backgroundColor: hexToRgba(ui.cardBg, ui.cardBgOpacity),
                      boxShadow: ui.cardShadow.replaceAll("_", " "),
                      border: `${ui.cardBorderWidth}px solid ${ui.cardBorderColor}`,
                    }}
                  >
                    <div className="aspect-[16/9] w-full">
                      <img
                        src={img}
                        alt={title}
                        className="h-48 w-48 object-cover transition duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "/no-image.png";
                        }}
                      />
                    </div>

                    <style>{`
                      .group:hover img { transform: scale(${ui.imgHoverScale}); }
                    `}</style>

                    <HotBadge />

                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-200 group-hover:opacity-100"
                      style={{
                        backgroundColor: hexToRgba(
                          ui.overlayBg,
                          ui.overlayOpacity,
                        ),
                      }}
                    >
                      <div
                        className="cursor-pointer rounded-full border px-5 py-2 tracking-widest backdrop-blur-sm"
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
                      className="line-clamp-1 text-center leading-snug"
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
                      className="mt-1 line-clamp-1 text-center uppercase tracking-wide"
                      style={{
                        backgroundColor: hexToRgba(
                          ui.providerBg,
                          ui.providerBgOpacity,
                        ),
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
