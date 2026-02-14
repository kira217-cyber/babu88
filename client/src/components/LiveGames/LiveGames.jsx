import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

// ✅ Flag URL map (no design change)
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

const fetchLiveGamesColor = async () => {
  const { data } = await api.get("/api/livegames-color");
  return data;
};

const StatusBadge = ({ text, variant, styles }) => {
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

const LiveGames = () => {
  const { data: liveColor } = useQuery({
    queryKey: ["livegames-color"],
    queryFn: fetchLiveGamesColor,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const styles = useMemo(() => {
    const d = liveColor || {};
    return {
      // Card
      cardBg: d.cardBg || "#ffffff",
      cardBorderRgba: hexToRgba(
        d.cardBorder || "#000000",
        d.cardBorderOpacity ?? 0.1,
      ),

      // Top
      topBarBg: d.topBarBg || "#f5b400",
      titleText: d.titleText || "#000000",
      titleTextSize: d.titleTextSize ?? 12,

      // Datetime
      datetimeTextRgba: hexToRgba(
        d.datetimeText || "#000000",
        d.datetimeOpacity ?? 0.55,
      ),
      datetimeTextSize: d.datetimeTextSize ?? 12,

      // Team row
      teamNameText: d.teamNameText || "#000000",
      teamNameTextSize: d.teamNameTextSize ?? 13,

      scoreText: d.scoreText || "#000000",
      scoreTextSize: d.scoreTextSize ?? 13,

      dashTextRgba: hexToRgba(d.dashText || "#000000", d.dashOpacity ?? 0.3),
      dashTextSize: d.dashTextSize ?? 12,

      // Badge
      badgeUpcomingBg: d.badgeUpcomingBg || "#000000",
      badgeUpcomingText: d.badgeUpcomingText || "#ffffff",
      badgeLiveBg: d.badgeLiveBg || "#ff2d2d",
      badgeLiveText: d.badgeLiveText || "#ffffff",
      badgeTextSize: d.badgeTextSize ?? 10,

      // Scrollbar
      scrollbarTrack: d.scrollbarTrack || "#cfcfcf",
      scrollbarThumbFrom: d.scrollbarThumbFrom || "#f5b400",
      scrollbarThumbTo: d.scrollbarThumbTo || "#c78a00",
      scrollbarHoverFrom: d.scrollbarHoverFrom || "#ffcf3a",
      scrollbarHoverTo: d.scrollbarHoverTo || "#c78a00",
    };
  }, [liveColor]);

  // 🔁 Replace this demo data with your API data
  const matches = useMemo(
    () => [
      {
        id: 1,
        statusText: "2nd Innings",
        statusType: "live",
        title: "ICC U19 World Cup",
        datetime: "Feb 04, 2026 13:30:00",
        teams: [
          { name: "India U19", countryCode: "IN", score: "16/0 (3)" },
          { name: "Afghanistan U19", countryCode: "AF", score: "310/4 (50)" },
        ],
      },
      {
        id: 2,
        statusText: "2nd Innings",
        statusType: "live",
        title: "ICC Mens T20 World Cup Warm-up Match",
        datetime: "Feb 04, 2026 15:30:00",
        teams: [
          { name: "Afghanistan", countryCode: "AF", score: "182/6 (20)" },
          { name: "West Indies", countryCode: "JM", score: "38/2 (4.4)" },
        ],
      },
      {
        id: 3,
        statusText: "1st Innings",
        statusType: "live",
        title: "Emirates D10 Tournament",
        datetime: "Feb 04, 2026 17:00:00",
        teams: [
          {
            name: "Sharjah",
            countryCode: "GEN",
            score: "0/0 (0)",
            flagUrl: "https://cdn-icons-png.flaticon.com/512/502/502195.png",
          },
          {
            name: "Dubai",
            countryCode: "GEN",
            score: "145/5 (9)",
            flagUrl: "https://cdn-icons-png.flaticon.com/512/502/502195.png",
          },
        ],
      },
      {
        id: 4,
        statusText: "Upcoming",
        statusType: "upcoming",
        title: "Emirates D10 Tournament",
        datetime: "Feb 04, 2026 19:15:00",
        teams: [
          {
            name: "Emirates Blues",
            countryCode: "GEN",
            score: "",
            flagUrl: "https://cdn-icons-png.flaticon.com/512/502/502195.png",
          },
          {
            name: "Emirates Red",
            countryCode: "GEN",
            score: "",
            flagUrl: "https://cdn-icons-png.flaticon.com/512/502/502195.png",
          },
        ],
      },
      {
        id: 5,
        statusText: "Upcoming",
        statusType: "upcoming",
        title: "ICC Mens T20 World Cup",
        datetime: "Feb 04, 2026 19:30:00",
        teams: [
          { name: "India", countryCode: "IN", score: "" },
          { name: "South Africa", countryCode: "ZA", score: "" },
        ],
      },
    ],
    [],
  );

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
            // Firefox scrollbar-color dynamic
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
              "
              style={{
                backgroundColor: styles.cardBg,
                border: `1px solid ${styles.cardBorderRgba}`,
              }}
            >
              {/* Top yellow bar */}
              <div
                className="px-3 py-2 flex items-center gap-2"
                style={{ backgroundColor: styles.topBarBg }}
              >
                <StatusBadge
                  text={m.statusText}
                  variant={m.statusType === "upcoming" ? "upcoming" : "live"}
                  styles={styles}
                />
                <p
                  className="font-extrabold line-clamp-1"
                  style={{
                    color: styles.titleText,
                    fontSize: `${styles.titleTextSize}px`,
                  }}
                >
                  {m.title}
                </p>
              </div>

              <div className="px-3 py-3">
                <p
                  className="font-bold"
                  style={{
                    color: styles.datetimeTextRgba,
                    fontSize: `${styles.datetimeTextSize}px`,
                  }}
                >
                  {m.datetime}
                </p>

                <div className="mt-3 space-y-3">
                  {m.teams.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* ✅ Flag image only (no design change) */}
                        <img
                          src={
                            t.flagUrl ||
                            flagMap[t.countryCode] ||
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

                      {t.score ? (
                        <p
                          className="font-extrabold whitespace-nowrap"
                          style={{
                            color: styles.scoreText,
                            fontSize: `${styles.scoreTextSize}px`,
                          }}
                        >
                          {t.score}
                        </p>
                      ) : (
                        <span
                          className="font-bold"
                          style={{
                            color: styles.dashTextRgba,
                            fontSize: `${styles.dashTextSize}px`,
                          }}
                        >
                          —
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom scrollbar styling */}
        <style>{`
          /* Chrome/Edge/Safari */
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
