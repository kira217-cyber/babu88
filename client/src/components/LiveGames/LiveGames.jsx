// src/components/LiveGames.jsx
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { api } from "../../api/axios";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useLanguage } from "../../Context/LanguageProvider";

const MASTER_API_URL = import.meta.env.VITE_MASTER_API_URL;

const flagMap = {
  BD: "https://flagsapi.com/BD/shiny/64.png",
  IN: "https://flagsapi.com/IN/shiny/64.png",
  NP: "https://flagsapi.com/NP/shiny/64.png",
  AF: "https://flagsapi.com/AF/shiny/64.png",
  ZA: "https://flagsapi.com/ZA/shiny/64.png",
  JM: "https://flagsapi.com/JM/shiny/64.png",
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

const fetchLiveGamesColor = async () => {
  const { data } = await api.get("/api/livegames-color");
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

const fetchGlobalLiveGame = async () => {
  try {
    const apiKey = await getSavedApiKey();

    if (!apiKey || !MASTER_API_URL) {
      return {};
    }

    const { data } = await axios.get(
      `${MASTER_API_URL}/api/white-label/live-game`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      },
    );

    return data?.data || {};
  } catch (error) {
    console.error("White label live game config fetch failed:", error);
    return {};
  }
};

const fetchLiveGames = async () => {
  try {
    const res = await axios.get(
      "https://api.oraclegames.live/api/cricket/matches",
      {
        headers: { Accept: "application/json" },
      },
    );

    return res.data?.data || [];
  } catch (error) {
    console.error("Live cricket matches fetch failed:", error);
    return [];
  }
};

const StatusBadge = ({ text, variant, styles }) => {
  const isUpcoming = variant === "upcoming";
  const bg = isUpcoming ? styles.badgeUpcomingBg : styles.badgeLiveBg;
  const color = isUpcoming ? styles.badgeUpcomingText : styles.badgeLiveText;

  return (
    <span
      className="rounded-md px-2 py-[2px] font-extrabold"
      style={{
        backgroundColor: bg,
        color,
        fontSize: `${styles.badgeTextSize}px`,
      }}
    >
      {text}
    </span>
  );
};

const getStatusLabel = (state, isFetching) => {
  const s = String(state || "").toLowerCase();

  if (isFetching) return { label: "UPDATING", variant: "upcoming" };
  if (s === "live") return { label: "LIVE", variant: "live" };

  if (["upcoming", "preview", "scheduled", "not started", "soon"].includes(s)) {
    return { label: "SOON", variant: "upcoming" };
  }

  if (
    ["ended", "complete", "completed", "result", "finished", "end"].includes(s)
  ) {
    return { label: "END", variant: "upcoming" };
  }

  return { label: "SOON", variant: "upcoming" };
};

const LiveGames = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();
  const token = useSelector((state) => state.auth.token);

  const { data: liveColor } = useQuery({
    queryKey: ["livegames-color"],
    queryFn: fetchLiveGamesColor,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const { data: matchesRaw = [], isFetching } = useQuery({
    queryKey: ["live-cricket-matches"],
    queryFn: fetchLiveGames,
    staleTime: 0,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const { data: globalGame = {} } = useQuery({
    queryKey: ["white-label-live-game-global"],
    queryFn: fetchGlobalLiveGame,
    staleTime: 30 * 1000,
    retry: false,
  });

  const globalGameUID = useMemo(() => {
    return String(
      globalGame?.gameUID || globalGame?.gameUId || globalGame?.gameId || "",
    ).trim();
  }, [globalGame]);

  const isGlobalActive = globalGame?.isActive !== false;
  const openInNewTab = globalGame?.openInNewTab !== false;

  const styles = useMemo(() => {
    const d = liveColor || {};

    return {
      cardBg: d.cardBg || "#ffffff",
      cardBorderRgba: hexToRgba(
        d.cardBorder || "#000000",
        d.cardBorderOpacity ?? 0.1,
      ),

      topBarBg: d.topBarBg || "#f5b400",
      titleText: d.titleText || "#000000",
      titleTextSize: d.titleTextSize ?? 12,

      datetimeTextRgba: hexToRgba(
        d.datetimeText || "#000000",
        d.datetimeOpacity ?? 0.55,
      ),
      datetimeTextSize: d.datetimeTextSize ?? 12,

      teamNameText: d.teamNameText || "#000000",
      teamNameTextSize: d.teamNameTextSize ?? 13,

      scoreText: d.scoreText || "#000000",
      scoreTextSize: d.scoreTextSize ?? 13,

      badgeUpcomingBg: d.badgeUpcomingBg || "#000000",
      badgeUpcomingText: d.badgeUpcomingText || "#ffffff",
      badgeLiveBg: d.badgeLiveBg || "#ff2d2d",
      badgeLiveText: d.badgeLiveText || "#ffffff",
      badgeTextSize: d.badgeTextSize ?? 10,

      scrollbarTrack: d.scrollbarTrack || "#cfcfcf",
      scrollbarThumbFrom: d.scrollbarThumbFrom || "#f5b400",
      scrollbarThumbTo: d.scrollbarThumbTo || "#c78a00",
      scrollbarHoverFrom: d.scrollbarHoverFrom || "#ffcf3a",
      scrollbarHoverTo: d.scrollbarHoverTo || "#c78a00",
    };
  }, [liveColor]);

  const resolveImg = (path) => {
    if (!path) return "";

    const p = String(path).trim();
    if (!p) return "";

    if (/^https?:\/\//i.test(p)) return p;

    const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
    const normalizedPath = p.startsWith("/") ? p : `/${p}`;

    return base ? `${base}${normalizedPath}` : normalizedPath;
  };

  const matches = useMemo(() => {
    return (matchesRaw || []).map((m) => {
      const { label, variant } = getStatusLabel(m.state, isFetching);

      return {
        id: m.matchId || m._id || `${m?.team1?.name}-${m?.team2?.name}`,
        statusText: label,
        statusType: variant,
        title: m.subtitle ? `${m.title} • ${m.subtitle}` : m.title,
        teams: [
          {
            name: m?.team1?.name || "TEAM 1",
            countryCode: m?.team1?.countryCode || "GEN",
            flagUrl: m?.team1?.flag || "",
            score: m?.team1?.score || "",
          },
          {
            name: m?.team2?.name || "TEAM 2",
            countryCode: m?.team2?.countryCode || "GEN",
            flagUrl: m?.team2?.flag || "",
            score: m?.team2?.score || "",
          },
        ],
      };
    });
  }, [matchesRaw, isFetching]);

  const handlePlay = () => {
    if (!isGlobalActive) {
      toast.error(isBangla ? "লাইভ গেম এখন বন্ধ আছে" : "Live game is inactive");
      return;
    }

    if (!globalGameUID) {
      toast.error(
        isBangla ? "লাইভ গেম আইডি পাওয়া যায়নি" : "Live game id not found",
      );
      return;
    }

    if (!token) {
      toast.error(isBangla ? "খেলতে লগইন করুন" : "Please login to play");
      navigate("/login");
      return;
    }

    const url = `/playgame/${globalGameUID}`;

    if (openInNewTab) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(url, {
      state: {
        game_uid: globalGameUID,
        liveGame: true,
      },
    });
  };

  return (
    <section className="mt-4 w-full">
      <div className="mx-auto max-w-[1500px] px-2 py-3 lg:px-0">
        <div
          className="live-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden pb-4 pr-2"
          style={{
            scrollbarColor: `${styles.scrollbarThumbFrom} ${styles.scrollbarTrack}`,
            scrollbarWidth: "thin",
          }}
        >
          {matches.map((m) => (
            <div
              key={m.id}
              className={`snap-start min-w-[280px] overflow-hidden rounded-xl sm:min-w-[320px] lg:min-w-[360px] ${
                isGlobalActive && globalGameUID
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-70"
              }`}
              style={{
                backgroundColor: styles.cardBg,
                border: `1px solid ${styles.cardBorderRgba}`,
              }}
              onClick={handlePlay}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handlePlay();
              }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{ backgroundColor: styles.topBarBg }}
              >
                <StatusBadge
                  text={String(m.statusText || "").toUpperCase()}
                  variant={m.statusType === "upcoming" ? "upcoming" : "live"}
                  styles={styles}
                />

                <span className="ml-auto text-[10px] font-extrabold text-black/70">
                  {isFetching ? "Updating..." : ""}
                </span>
              </div>

              <div className="px-3 py-3">
                <div
                  className="font-bold"
                  style={{
                    color: styles.datetimeTextRgba,
                    fontSize: `${styles.datetimeTextSize}px`,
                  }}
                >
                  <p
                    className="line-clamp-1 font-extrabold"
                    style={{
                      color: styles.titleText,
                      fontSize: `${styles.titleTextSize}px`,
                    }}
                  >
                    {m.title}
                  </p>
                </div>

                <div className="mt-3 space-y-3">
                  {m.teams.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <img
                          src={
                            t.flagUrl
                              ? resolveImg(t.flagUrl)
                              : flagMap[t.countryCode] ||
                                "https://cdn-icons-png.flaticon.com/512/502/502195.png"
                          }
                          alt={t.name}
                          className="h-[18px] w-[18px] object-cover"
                          loading="lazy"
                        />

                        <p
                          className="truncate font-extrabold"
                          style={{
                            color: styles.teamNameText,
                            fontSize: `${styles.teamNameTextSize}px`,
                          }}
                        >
                          {t.name}
                        </p>
                      </div>

                      <p
                        className="shrink-0 font-extrabold"
                        style={{
                          color: styles.scoreText,
                          fontSize: `${styles.scoreTextSize}px`,
                        }}
                      >
                        {t.score || ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .live-scroll::-webkit-scrollbar {
            height: 10px;
          }

          .live-scroll::-webkit-scrollbar-track {
            background: ${styles.scrollbarTrack};
            border-radius: 999px;
          }

          .live-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(90deg, ${styles.scrollbarThumbFrom}, ${styles.scrollbarThumbTo});
            border-radius: 999px;
          }

          .live-scroll::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(90deg, ${styles.scrollbarHoverFrom}, ${styles.scrollbarHoverTo});
          }
        `}</style>
      </div>
    </section>
  );
};

export default LiveGames;
