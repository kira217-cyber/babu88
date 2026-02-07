import React, { useMemo } from "react";

// ✅ Flag URL map (no design change)
const flagMap = {
  BD: "https://flagsapi.com/BD/shiny/64.png", // Bangladesh
  IN: "https://flagsapi.com/IN/shiny/64.png", // India
  NP: "https://flagsapi.com/NP/shiny/64.png", // Nepal
  AF: "https://flagsapi.com/AF/shiny/64.png", // Afghanistan
  ZA: "https://flagsapi.com/ZA/shiny/64.png", // South Africa
  JM: "https://flagsapi.com/JM/shiny/64.png", // Jamaica (West Indies)
};

const StatusBadge = ({ text, variant }) => {
  const cls =
    variant === "upcoming" ? "bg-black text-white" : "bg-[#ff2d2d] text-white"; // innings red

  return (
    <span
      className={`px-2 py-[2px] rounded-md text-[10px] font-extrabold ${cls}`}
    >
      {text}
    </span>
  );
};

const LiveGames = () => {
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
          // Tournament team: flag not a country → using generic cricket icon image
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
        >
          {matches.map((m) => (
            <div
              key={m.id}
              className="
                snap-start
                min-w-[280px] sm:min-w-[320px] lg:min-w-[360px]
                bg-white rounded-xl
                border border-black/10
                overflow-hidden
              "
            >
              {/* Top yellow bar */}
              <div className="bg-[#f5b400] px-3 py-2 flex items-center gap-2">
                <StatusBadge
                  text={m.statusText}
                  variant={m.statusType === "upcoming" ? "upcoming" : "live"}
                />
                <p className="text-[12px] font-extrabold text-black line-clamp-1">
                  {m.title}
                </p>
              </div>

              <div className="px-3 py-3">
                <p className="text-[12px] font-bold text-black/55">
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
                        <p className="text-[13px] font-extrabold text-black truncate">
                          {t.name}
                        </p>
                      </div>

                      {t.score ? (
                        <p className="text-[13px] font-extrabold text-black whitespace-nowrap">
                          {t.score}
                        </p>
                      ) : (
                        <span className="text-[12px] font-bold text-black/30">
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
            background: #cfcfcf;
            border-radius: 999px;
          }
          .live-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(90deg, #f5b400, #c78a00);
            border-radius: 999px;
          }
          .live-scroll::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(90deg, #ffcf3a, #c78a00);
          }

          /* Firefox */
          .live-scroll {
            scrollbar-color: #f5b400 #cfcfcf;
            scrollbar-width: thin;
          }
        `}</style>
      </div>
    </section>
  );
};

export default LiveGames;
