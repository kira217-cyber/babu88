// src/components/LiveGames.jsx
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { api } from "../../api/axios";

// Flag fallback map (kept exactly as it was)
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

// Fetch live games color settings (kept as is)
const fetchLiveGamesColor = async () => {
  const { data } = await api.get("/api/livegames-color");
  return data;
};

// ✅ Fetch real live cricket matches from Oracle API
const fetchLiveGames = async () => {
  const res = await axios.get(
    "https://api.oraclegames.live/api/cricket/matches",
    {
      headers: { Accept: "application/json" },
    },
  );
  return res.data?.data || [];
};

// ✅ Fetch GLOBAL gameUID from your DB (single config doc)
const fetchGlobalGame = async () => {
  // expected response: { gameUID: "69987ca39fa20f5dfecbdc95", isActive: true }
  const { data } = await api.get("/api/live-games/global");
  return data || {};
};

const StatusBadge = ({ text, variant, styles }) => {
  // only 2 variants existed in design; keep same colors:
  // - "upcoming" style for SOON / UPDATING / END
  // - "live" style for LIVE
  const isUpcoming = variant === "upcoming";
  const bg = isUpcoming ? styles.badgeUpcomingBg : styles.badgeLiveBg;
  const color = isUpcoming ? styles.badgeUpcomingText : styles.badgeLiveText;

  return (
    <span
      className="px-2 py-[2px] rounded-md font-extrabold"
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

// ✅ map API state -> required labels: End, Soon, Updating, Live
const getStatusLabel = (state, isFetching) => {
  const s = String(state || "").toLowerCase();

  if (isFetching) return { label: "UPDATING", variant: "upcoming" };
  if (s === "live") return { label: "LIVE", variant: "live" };

  // common possible values from cricket feeds
  if (["upcoming", "preview", "scheduled", "not started", "soon"].includes(s))
    return { label: "SOON", variant: "upcoming" };

  if (
    ["ended", "complete", "completed", "result", "finished", "end"].includes(s)
  )
    return { label: "END", variant: "upcoming" };

  // fallback
  return { label: "SOON", variant: "upcoming" };
};

const LiveGames = () => {
  // Color settings from admin
  const { data: liveColor } = useQuery({
    queryKey: ["livegames-color"],
    queryFn: fetchLiveGamesColor,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // ✅ matches from oracle cricket api
  // ✅ auto refetch every 30 seconds (live score updates)
  const { data: matchesRaw = [], isFetching } = useQuery({
    queryKey: ["live-cricket-matches"],
    queryFn: fetchLiveGames,
    staleTime: 0,
    refetchInterval: 30 * 1000, // ✅ every 30 sec
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // ✅ global game uid from DB (NO design impact)
  const { data: globalGame = {} } = useQuery({
    queryKey: ["live-games-global"],
    queryFn: fetchGlobalGame,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const globalGameUID = useMemo(() => {
    const uid = String(globalGame?.gameUID || "").trim();
    return uid;
  }, [globalGame]);

  const isGlobalActive = globalGame?.isActive !== false;

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

      dashTextRgba: hexToRgba(d.dashText || "#000000", d.dashOpacity ?? 0.3),
      dashTextSize: d.dashTextSize ?? 12,

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
    if (!base) return p.startsWith("/") ? p : `/${p}`;
    const normalizedPath = p.startsWith("/") ? p : `/${p}`;
    return `${base}${normalizedPath}`;
  };

  // ✅ Normalize Oracle cricket matches -> UI shape (design unchanged)
  const matches = useMemo(() => {
    return (matchesRaw || []).map((m) => {
      const { label, variant } = getStatusLabel(m.state, isFetching);

      return {
        id: m.matchId || m._id,
        // ⚠️ IMPORTANT: UI shows oracle matches, but click will go to GLOBAL uid
        gameUID: m.matchId,
        statusText: label,
        statusType: variant,
        title: m.subtitle ? `${m.title} • ${m.subtitle}` : m.title,
        datetime: null,
        teams: [
          {
            name: m?.team1?.name || "TEAM 1",
            countryCode: m?.team1?.name || "GEN",
            flagUrl: m?.team1?.flag || "",
            score: m?.team1?.score || "",
          },
          {
            name: m?.team2?.name || "TEAM 2",
            countryCode: m?.team2?.name || "GEN",
            flagUrl: m?.team2?.flag || "",
            score: m?.team2?.score || "",
          },
        ],
      };
    });
  }, [matchesRaw, isFetching]);

  // Open game detail in new tab (target="_blank")
  // ✅ NOW: always open GLOBAL game UID from DB (no extra params)
  const openGameInNewTab = () => {
    if (!isGlobalActive) return;
    if (!globalGameUID) return;
    const url = `/playgame/${globalGameUID}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="w-full mt-4">
      <div className="mx-auto max-w-[1500px] px-2 lg:px-0 py-3">
        {/* Horizontal scroll area */}
        <div
          className="
            live-scroll
            flex gap-4
            overflow-x-auto
            overflow-y-hidden
            pb-4
            pr-2
            snap-x snap-mandatory
          "
          style={{
            scrollbarColor: `${styles.scrollbarThumbFrom} ${styles.scrollbarTrack}`,
            scrollbarWidth: "thin",
          }}
        >
          {matches.map((m) => (
            <div
              key={m.id}
              className="
                snap-start
                min-w-[280px] sm:min-w-[320px] lg:min-w-[360px]
                rounded-xl
                overflow-hidden
                cursor-pointer
              "
              style={{
                backgroundColor: styles.cardBg,
                border: `1px solid ${styles.cardBorderRgba}`,
              }}
              // ✅ full card clickable (GLOBAL UID)
              onClick={openGameInNewTab}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openGameInNewTab();
              }}
            >
              {/* Top bar */}
              <div
                className="px-3 py-2 flex items-center gap-2"
                style={{ backgroundColor: styles.topBarBg }}
              >
                <StatusBadge
                  text={String(m.statusText || "").toUpperCase()}
                  variant={m.statusType === "upcoming" ? "upcoming" : "live"}
                  styles={styles}
                />

                {/* (optional tiny indicator; still ok) */}
                <span className="ml-auto text-[10px] font-extrabold text-black/70">
                  {isFetching ? "Updating..." : ""}
                </span>
              </div>

              <div className="px-3 py-3">
                <p
                  className="font-bold"
                  style={{
                    color: styles.datetimeTextRgba,
                    fontSize: `${styles.datetimeTextSize}px`,
                  }}
                >
                  <p
                    className="font-extrabold line-clamp-1"
                    style={{
                      color: styles.titleText,
                      fontSize: `${styles.titleTextSize}px`,
                    }}
                  >
                    {m.title}
                  </p>
                </p>

                <div className="mt-3 space-y-3">
                  {m.teams.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={
                            t.flagUrl
                              ? resolveImg(t.flagUrl)
                              : flagMap[t.countryCode] ||
                                "https://cdn-icons-png.flaticon.com/512/502/502195.png"
                          }
                          alt={t.name}
                          className="w-[18px] h-[18px] object-cover"
                          loading="lazy"
                        />
                        <p
                          className="font-extrabold truncate"
                          style={{
                            color: styles.teamNameText,
                            fontSize: `${styles.teamNameTextSize}px`,
                          }}
                        >
                          {t.name}
                        </p>
                      </div>

                      <p
                        className="font-extrabold shrink-0"
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

        {/* Custom scrollbar */}
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
