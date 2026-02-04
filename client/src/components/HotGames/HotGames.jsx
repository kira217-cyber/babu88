import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const HotBadge = () => (
  <span className="absolute top-2 right-2 px-2 py-[2px] rounded-full text-[10px] font-extrabold bg-[#ff3b30] text-white shadow">
    HOT
  </span>
);

const HotGames = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  // 🔁 এগুলো তোমার real data/API দিয়ে replace করবে
  const games = useMemo(
    () => [
      {
        id: "bb88-super-ace",
        title: "BB88 Super Ace",
        provider: "JILI",
        img: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
      {
        id: "aviator-1",
        title: "Aviator",
        provider: "AVIATOR STUDIO",
        img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
      {
        id: "fortune-gems-500",
        title: "Fortune Gems 500",
        provider: "JILI",
        img: "https://images.unsplash.com/photo-1612832020898-2d79b88b94fe?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
      {
        id: "aviator-2",
        title: "Aviator",
        provider: "SPRIBE",
        img: "https://images.unsplash.com/photo-1520975682031-a6ad9e93f4d3?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
      {
        id: "super-ace",
        title: "Super Ace",
        provider: "JILI",
        img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },

      {
        id: "crash-cricket",
        title: "BB88 Crash Cricket",
        provider: "JILI",
        img: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
      {
        id: "crazy-time",
        title: "Crazy Time",
        provider: "EVOLUTION GAMING",
        img: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
      {
        id: "fortune-gems-2",
        title: "Fortune Gems 2",
        provider: "JILI",
        img: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
      {
        id: "7up7down",
        title: "7up7down",
        provider: "JILI",
        img: "https://images.unsplash.com/photo-1518544881200-1c4b1a0f3b52?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
      {
        id: "funky-time",
        title: "Evo Funky Time",
        provider: "EVOLUTION GAMING",
        img: "https://images.unsplash.com/photo-1585079542156-2755d9c8a094?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },

      {
        id: "boxing-king",
        title: "Boxing King",
        provider: "JILI",
        img: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
      {
        id: "money-coming",
        title: "Money Coming",
        provider: "JILI",
        img: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
      {
        id: "super-ace-deluxe",
        title: "Super Ace Deluxe",
        provider: "JILI",
        img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
      {
        id: "wild-bounty-showdown",
        title: "Wild Bounty Showdown",
        provider: "PG SOFT",
        img: "https://images.unsplash.com/photo-1520975682031-a6ad9e93f4d3?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
      {
        id: "nft-aviatrix",
        title: "NFT Aviatrix",
        provider: "AVIATRIX",
        img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=60",
        hot: true,
      },
    ],
    [],
  );

  return (
    // ✅ only laptop/desktop
    <section className="hidden lg:block w-full">
      <div className="mx-auto max-w-[1500px] px-2 py-4 lg:px-0">
        {/* Title (same vibe) */}
        <div className="flex items-end justify-between">
          <h2 className="text-[28px] font-extrabold text-black tracking-tight">
            {isBangla ? "হট গেমস" : "Hot Games"}
          </h2>
        </div>

        {/* Grid like screenshot */}
        <div className="mt-5 grid grid-cols-5 gap-x-6 gap-y-8">
          {games.map((g) => (
            <div key={g.id} className="group">
              {/* Image card */}
              <button
                type="button"
                onClick={() => navigate(`/play/${g.id}`)}
                className="relative w-full overflow-hidden rounded-xl bg-black/5 shadow-[0_10px_25px_rgba(0,0,0,0.12)] focus:outline-none"
                title={g.title}
              >
                <div className="aspect-[16/9] w-full">
                  <img
                    src={g.img}
                    alt={g.title}
                    className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=60";
                    }}
                  />
                </div>

                {g.hot ? <HotBadge /> : null}

                {/* Hover overlay: transparent bg + PLAY text */}
                <div
                  className="
                    absolute inset-0
                    opacity-0 group-hover:opacity-100
                    transition duration-200
                    bg-black/25
                    flex items-center justify-center
                  "
                >
                  <div
                    className="
                      px-5 py-2
                      rounded-full
                      bg-white/10
                      border cursor-pointer border-white/25
                      backdrop-blur-sm
                      text-white
                      font-extrabold
                      tracking-widest
                      text-sm
                    "
                  >
                    PLAY
                  </div>
                </div>
              </button>

              {/* Text below image */}
              <div className="mt-2">
                <p className="text-[15px] font-extrabold text-black leading-snug line-clamp-1">
                  {g.title}
                </p>
                <p className="text-[11px] font-extrabold text-black/60 uppercase tracking-wide mt-1">
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
