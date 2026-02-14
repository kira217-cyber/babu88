import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  GiCrown,
  GiFlame,
  GiPokerHand,
  GiAirplane,
  GiCricketBat,
  GiCardAceSpades,
  GiRabbit,
  GiFishing,
  GiTwoCoins,
} from "react-icons/gi";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

const CATEGORIES = [
  { key: "jackpot", label: { bn: "জ্যাকপট", en: "Jackpot" }, icon: GiCrown },
  { key: "hot", label: { bn: "হট", en: "Hot" }, icon: GiFlame },
  { key: "slot", label: { bn: "স্লট", en: "Slot" }, icon: GiCardAceSpades },
  { key: "casino", label: { bn: "ক্যাসিনো", en: "Casino" }, icon: GiPokerHand },
  { key: "crash", label: { bn: "ক্র্যাশ", en: "Crash" }, icon: GiAirplane },
  {
    key: "cricket",
    label: { bn: "ক্রিকেট", en: "Cricket" },
    icon: GiCricketBat,
  },
  { key: "table", label: { bn: "টেবিল", en: "Table" }, icon: GiCardAceSpades },
  { key: "fast", label: { bn: "ফাস্ট", en: "Fast" }, icon: GiRabbit },
  {
    key: "catching_fish",
    label: { bn: "ক্যাচিং ফিশ", en: "Catching Fish" },
    icon: GiFishing,
  },
  { key: "asb", label: { bn: "ASB", en: "ASB" }, icon: GiTwoCoins },
];

// ✅ Demo games (replace with API data)
const GAMES = [
  {
    id: "super-ace-1",
    title: "Super Ace",
    category: "hot",
    image:
      "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/DtP4ZtTTSFMSTUxfRBlChuvPSaZ7F6AUlyCPF9HQ.png",
    badge: "HOT",
  },
  {
    id: "aviator-1",
    title: "Aviator",
    category: "crash",
    image:
      "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/DtP4ZtTTSFMSTUxfRBlChuvPSaZ7F6AUlyCPF9HQ.png",
    badge: "HOT",
  },
  {
    id: "fortune-gems-1",
    title: "Fortune Gems",
    category: "hot",
    image:
      "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/hRJKCIGfsKom04Ok44tFzyyHLxOTDSPXvPTQAvx6.jpg",
    badge: "HOT",
  },
  {
    id: "chicken-road-2",
    title: "Chicken Road 2",
    category: "hot",
    image:
      "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/1JbjzqcccNub15FEa8NFG8nBQbSqeO4Lzo3t33ad.jpg",
    badge: "HOT",
  },
  {
    id: "crazy-time-1",
    title: "Crazy Time",
    category: "hot",
    image:
      "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/3Y8aCs6xtWTxk6xtaxnkS9Zk7qAsOsvhgc0Jg0me.jpg",
    badge: "HOT",
  },
  {
    id: "crash-cricket-1",
    title: "Crash Cricket",
    category: "hot",
    image:
      "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/2DBG4VFxCy7icorMGJ3dvQVNBjKOzpcbDfVlBt2R.png",
    badge: "HOT",
  },
  {
    id: "roulette-1",
    title: "Roulette",
    category: "hot",
    image:
      "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/XKMsslvB0bgiBJ41meWZH3mO02J0ysgOdnE8WMc5.jpg",
    badge: "HOT",
  },
  {
    id: "fish-1",
    title: "Fishing King",
    category: "hot",
    image:
      "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/hRJKCIGfsKom04Ok44tFzyyHLxOTDSPXvPTQAvx6.jpg",
    badge: "HOT",
  },
  {
    id: "jackpot-1",
    title: "Jackpot Mega",
    category: "jackpot",
    image:
      "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/2DBG4VFxCy7icorMGJ3dvQVNBjKOzpcbDfVlBt2R.png",
    badge: "HOT",
  },
  {
    id: "asb-1",
    title: "ASB Game",
    category: "hot",
    image:
      "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/xCfRmJP2Fm1Fw9VEUHFoCtNaBpfTyXIYdr5Osuzl.png",
    badge: "HOT",
  },
  {
    id: "fast-1",
    title: "Fast Spin",
    category: "hot",
    image:
      "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/ad5CfULwpWYJ0qyEtT3a8Djc5eCghQwroEo1vLrv.jpg",
    badge: "HOT",
  },
  {
    id: "slot-2",
    title: "Slot Pro",
    category: "slot",
    image:
      "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/xCfRmJP2Fm1Fw9VEUHFoCtNaBpfTyXIYdr5Osuzl.png",
    badge: "HOT",
  },
];

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

const fetchGameCategoryColor = async () => {
  const { data } = await api.get("/api/gamecategory-color");
  return data;
};

const GameCard = ({ game, onClick, ui }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-xl ring-1 shadow-md"
      style={{
        backgroundColor: hexToRgba(ui.cardBg, ui.cardBgOpacity),
        boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
        // ring-1 ring-black/10 replacement
        border: `1px solid ${hexToRgba(ui.cardRing, ui.cardRingOpacity)}`,
      }}
      title={game.title}
      type="button"
    >
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={game.image}
          alt={game.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {game.badge && (
        <div className="absolute top-2 right-2">
          <span
            className="font-black px-2 py-1 rounded-full shadow"
            style={{
              backgroundColor: ui.badgeBg,
              color: ui.badgeText,
              fontSize: `${ui.badgeTextSize}px`,
            }}
          >
            {game.badge}
          </span>
        </div>
      )}
    </motion.button>
  );
};

const GameCategory = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const { data: colorDoc } = useQuery({
    queryKey: ["gamecategory-color"],
    queryFn: fetchGameCategoryColor,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const ui = useMemo(() => {
    const d = colorDoc || {};
    return {
      wrapBg: d.wrapBg || "#ffffff",
      wrapOpacity: d.wrapOpacity ?? 0.9,
      scrollerBg: d.scrollerBg || "#F5F5F5",

      btnActiveBg: d.btnActiveBg || "#F5B400",
      btnActiveText: d.btnActiveText || "#000000",

      btnInactiveBg: d.btnInactiveBg || "#ffffff",
      btnInactiveTextRgba: hexToRgba(
        d.btnInactiveText || "#000000",
        d.btnInactiveTextOpacity ?? 0.8,
      ),

      btnTextSize: d.btnTextSize ?? 14,

      trackBgRgba: hexToRgba(d.trackBg || "#000000", d.trackOpacity ?? 0.1),
      thumbBg: d.thumbBg || "#C49A00",

      emptyTextRgba: hexToRgba(
        d.emptyText || "#000000",
        d.emptyTextOpacity ?? 0.6,
      ),
      emptyTextSize: d.emptyTextSize ?? 14,

      cardBg: d.cardBg || "#ffffff",
      cardBgOpacity: d.cardBgOpacity ?? 0.05,

      cardRing: d.cardRing || "#000000",
      cardRingOpacity: d.cardRingOpacity ?? 0.1,

      badgeBg: d.badgeBg || "#ff2d2d",
      badgeText: d.badgeText || "#ffffff",
      badgeTextSize: d.badgeTextSize ?? 10,
    };
  }, [colorDoc]);

  const [active, setActive] = useState("hot");

  // ✅ category scroll refs
  const scrollerRef = useRef(null);
  const trackRef = useRef(null);
  const btnRefs = useRef({}); // key -> element

  // ✅ underline thumb state
  const [thumb, setThumb] = useState({ width: 40, x: 0 });

  const games = useMemo(() => {
    return GAMES.filter((g) => g.category === active);
  }, [active]);

  const handlePlay = (game) => {
    navigate(`/playgame/${game.id}`, { state: { game } });
  };

  const updateThumb = () => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    const { scrollLeft, scrollWidth, clientWidth } = scroller;

    // if no overflow
    if (scrollWidth <= clientWidth) {
      setThumb({ width: track.clientWidth, x: 0 });
      return;
    }

    const trackW = track.clientWidth;

    // thumb width proportional
    const thumbW = Math.max(28, (clientWidth / scrollWidth) * trackW);

    const maxScroll = scrollWidth - clientWidth;
    const maxX = trackW - thumbW;

    const x = (scrollLeft / maxScroll) * maxX;

    setThumb({ width: thumbW, x });
  };

  useEffect(() => {
    updateThumb();

    const onResize = () => updateThumb();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    // active change এর পর layout update
    requestAnimationFrame(() => updateThumb());
  }, [active]);

  const scrollToButtonCenter = (key) => {
    const scroller = scrollerRef.current;
    const btn = btnRefs.current[key];
    if (!scroller || !btn) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const currentLeft = scroller.scrollLeft;
    const btnCenter =
      btnRect.left - scrollerRect.left + btnRect.width / 2 + currentLeft;

    const target = btnCenter - scroller.clientWidth / 2;

    scroller.scrollTo({ left: target, behavior: "smooth" });
  };

  const handleCategoryClick = (key) => {
    setActive(key);
    scrollToButtonCenter(key);
  };

  return (
    <div className="w-full">
      {/* ✅ Category Bar */}
      <div
        className="w-full rounded-md px-2 mt-4"
        style={{ backgroundColor: hexToRgba(ui.wrapBg, ui.wrapOpacity) }}
      >
        <div
          ref={scrollerRef}
          onScroll={updateThumb}
          className="
            flex items-center gap-3 py-2
            overflow-x-auto whitespace-nowrap
            scroll-smooth
            [scrollbar-width:none]
            rounded-md mb-2
          "
          style={{
            WebkitOverflowScrolling: "touch",
            backgroundColor: ui.scrollerBg,
          }}
        >
          {/* hide scrollbar (webkit) */}
          <style>
            {`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}
          </style>

          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const isActive = active === c.key;

            return (
              <button
                key={c.key}
                ref={(el) => {
                  if (el) btnRefs.current[c.key] = el;
                }}
                onClick={() => handleCategoryClick(c.key)}
                type="button"
                className={`
                  hide-scrollbar
                  shrink-0 inline-flex items-center gap-2
                  px-4 py-2 rounded-full
                  font-extrabold
                  transition
                  ${isActive ? "shadow-sm" : "hover:bg-black/5"}
                `}
                style={{
                  fontSize: `${ui.btnTextSize}px`,
                  backgroundColor: isActive ? ui.btnActiveBg : ui.btnInactiveBg,
                  color: isActive ? ui.btnActiveText : ui.btnInactiveTextRgba,
                }}
              >
                <Icon className="text-xl" />
                <span>{isBangla ? c.label.bn : c.label.en}</span>
              </button>
            );
          })}
        </div>

        {/* ✅ Underline = scrollbar indicator (move with scroll) */}
        <div className="px-3 pb-2">
          <div
            ref={trackRef}
            className="h-[6px] w-full rounded-full overflow-hidden relative"
            style={{ backgroundColor: ui.trackBgRgba }}
          >
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ backgroundColor: ui.thumbBg }}
              animate={{ width: thumb.width, x: thumb.x }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            />
          </div>
        </div>
      </div>

      {/* ✅ Games Grid */}
      <div className="mt-4">
        {games.length === 0 ? (
          <div
            className="text-center py-10 font-semibold"
            style={{
              color: ui.emptyTextRgba,
              fontSize: `${ui.emptyTextSize}px`,
            }}
          >
            {isBangla
              ? "এই ক্যাটাগরিতে কোনো গেম নেই"
              : "No games in this category"}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 px-2">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => handlePlay(game)}
                ui={ui}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCategory;
