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

const CATEGORIES = [
  { key: "jackpot", label: { bn: "জ্যাকপট", en: "Jackpot" }, icon: GiCrown },
  { key: "hot", label: { bn: "হট", en: "Hot" }, icon: GiFlame },
  { key: "slot", label: { bn: "স্লট", en: "Slot" }, icon: GiCardAceSpades },
  {
    key: "casino",
    label: { bn: "ক্যাসিনো", en: "Casino" },
    icon: GiPokerHand,
  },
  { key: "crash", label: { bn: "ক্র্যাশ", en: "Crash" }, icon: GiAirplane },
  {
    key: "cricket",
    label: { bn: "ক্রিকেট", en: "Cricket" },
    icon: GiCricketBat,
  },
  {
    key: "table",
    label: { bn: "টেবিল", en: "Table" },
    icon: GiCardAceSpades,
  },
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
      "https://i.ibb.co/5XmZSPWz/detailed-esports-gaming-logo-template-1029473-588861-ezgif-com-avif-to-jpg-converter.jpg",
    badge: "HOT",
  },
  {
    id: "aviator-1",
    title: "Aviator",
    category: "crash",
    image: "https://i.ibb.co/2v2M4KX/aviator.jpg",
    badge: "HOT",
  },
  {
    id: "fortune-gems-1",
    title: "Fortune Gems",
    category: "slot",
    image: "https://i.ibb.co/9n0c4cS/fortune-gems.jpg",
    badge: "HOT",
  },
  {
    id: "chicken-road-2",
    title: "Chicken Road 2",
    category: "hot",
    image: "https://i.ibb.co/7yVspqF/chicken-road.jpg",
    badge: "HOT",
  },
  {
    id: "crazy-time-1",
    title: "Crazy Time",
    category: "casino",
    image: "https://i.ibb.co/pWwq8V7/crazy-time.jpg",
    badge: "HOT",
  },
  {
    id: "crash-cricket-1",
    title: "Crash Cricket",
    category: "cricket",
    image: "https://i.ibb.co/Cw0Xn8W/crash-cricket.jpg",
    badge: "HOT",
  },
  {
    id: "roulette-1",
    title: "Roulette",
    category: "table",
    image: "https://i.ibb.co/YWvB2xQ/roulette.jpg",
    badge: "HOT",
  },
  {
    id: "fish-1",
    title: "Fishing King",
    category: "catching_fish",
    image: "https://i.ibb.co/7nGf6H2/fishing.jpg",
    badge: "HOT",
  },
  {
    id: "jackpot-1",
    title: "Jackpot Mega",
    category: "jackpot",
    image: "https://i.ibb.co/8g9T1Yx/jackpot.jpg",
    badge: "HOT",
  },
  {
    id: "asb-1",
    title: "ASB Game",
    category: "asb",
    image: "https://i.ibb.co/KbX3bKx/asb.jpg",
    badge: "HOT",
  },
  {
    id: "fast-1",
    title: "Fast Spin",
    category: "fast",
    image: "https://i.ibb.co/ZdNf4r9/fast.jpg",
    badge: "HOT",
  },
  {
    id: "slot-2",
    title: "Slot Pro",
    category: "slot",
    image: "https://i.ibb.co/0m0B6zH/slot.jpg",
    badge: "HOT",
  },
];

const GameCard = ({ game, onClick }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-xl bg-white/5 ring-1 ring-black/10 shadow-md"
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
          <span className="text-[10px] font-black px-2 py-1 rounded-full bg-[#ff2d2d] text-white shadow">
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
      <div className="w-full bg-white/90 rounded-md px-2 mt-4">
        <div
          ref={scrollerRef}
          onScroll={updateThumb}
          className="
            flex items-center gap-3 py-2
            overflow-x-auto whitespace-nowrap
            scroll-smooth
            [scrollbar-width:none]
            rounded-md mb-2
            bg-[#F5F5F5]
          "
          style={{
            WebkitOverflowScrolling: "touch",
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
                  font-extrabold text-sm
                  transition
                  ${
                    isActive
                      ? "bg-[#F5B400] text-black"
                      : "bg-white text-black/80"
                  }
                  ${isActive ? "shadow-sm" : "hover:bg-black/5"}
                `}
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
            className="h-[6px] w-full bg-black/10 rounded-full overflow-hidden relative"
          >
            <motion.div
              className="absolute top-0 left-0 h-full bg-[#C49A00] rounded-full"
              animate={{ width: thumb.width, x: thumb.x }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            />
          </div>
        </div>
      </div>

      {/* ✅ Games Grid */}
      <div className="mt-4">
        {games.length === 0 ? (
          <div className="text-center py-10 text-black/60 font-semibold">
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCategory;
