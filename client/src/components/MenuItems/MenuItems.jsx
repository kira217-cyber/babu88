import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../Context/LanguageProvider";

// ✅ Demo provider images (তুমি পরে real image বসাবে)
const PROVIDERS = {
  slot: [
    { id: "jili", name: "JILI", img: "https://i.ibb.co/7kQ5m2m/jili.png" },
    { id: "pg", name: "PG", img: "https://i.ibb.co/YfQb0yD/pg.png" },
    { id: "inout", name: "INOUT", img: "https://i.ibb.co/2Sg9P4w/inout.png" },
    {
      id: "winspinity",
      name: "Winspinity",
      img: "https://i.ibb.co/8sS7c7m/winspinity.png",
    },
    { id: "jdb", name: "JDB", img: "https://i.ibb.co/8D2K2bD/jdb.png" },
    { id: "bng", name: "BNG", img: "https://i.ibb.co/mB3z6tF/bng.png" },
    {
      id: "habanero",
      name: "Habanero",
      img: "https://i.ibb.co/3f8bPPv/habanero.png",
    },
    {
      id: "smartsoft",
      name: "SmartSoft",
      img: "https://i.ibb.co/4K3MZfM/smartsoft.png",
    },
    {
      id: "gambit",
      name: "Gambit",
      img: "https://i.ibb.co/VvP3n1d/gambit.png",
    },
    {
      id: "million",
      name: "Million",
      img: "https://i.ibb.co/3rj1x2y/million.png",
    },
    {
      id: "pragmatic",
      name: "Pragmatic Play",
      img: "https://i.ibb.co/3mKcQ9t/pragmatic.png",
    },
    {
      id: "spade",
      name: "Spadegaming",
      img: "https://i.ibb.co/1Zp3f9j/spade.png",
    },
    {
      id: "playngo",
      name: "Play'n GO",
      img: "https://i.ibb.co/1Mck7Wb/playngo.png",
    },
    {
      id: "redtiger",
      name: "Red Tiger",
      img: "https://i.ibb.co/fF2gQmG/redtiger.png",
    },
    {
      id: "microgaming",
      name: "Microgaming",
      img: "https://i.ibb.co/5h1sZsQ/microgaming.png",
    },
    {
      id: "onegame",
      name: "OneGame",
      img: "https://i.ibb.co/9yQ3PpH/onegame.png",
    },
    {
      id: "playtech",
      name: "Playtech",
      img: "https://i.ibb.co/6bJt7m4/playtech.png",
    },
    {
      id: "relax",
      name: "Relax Gaming",
      img: "https://i.ibb.co/8Y7dB3f/relax.png",
    },
    {
      id: "netent",
      name: "NetEnt",
      img: "https://i.ibb.co/0GZK9XJ/netent.png",
    },
    {
      id: "nolimit",
      name: "NoLimit",
      img: "https://i.ibb.co/vc2qKc9/nolimit.png",
    },
  ],
  casino: [
    {
      id: "evolution",
      name: "Evolution",
      img: "https://i.ibb.co/8bKcJXJ/evolution.png",
    },
    {
      id: "pragmatic-live",
      name: "Pragmatic Live",
      img: "https://i.ibb.co/3mKcQ9t/pragmatic.png",
    },
    { id: "ezugi", name: "Ezugi", img: "https://i.ibb.co/3sKq9YQ/ezugi.png" },
  ],
  crash: [
    {
      id: "spribe",
      name: "SPRIBE",
      img: "https://i.ibb.co/0y1s7b6/spribe.png",
    },
    {
      id: "smartsoft-crash",
      name: "SmartSoft",
      img: "https://i.ibb.co/4K3MZfM/smartsoft.png",
    },
  ],
  cricket: [
    {
      id: "cricket-1",
      name: "Cricket",
      img: "https://i.ibb.co/0y1s7b6/spribe.png",
    },
  ],
  table: [
    {
      id: "table-1",
      name: "Table Games",
      img: "https://i.ibb.co/5h1sZsQ/microgaming.png",
    },
  ],
  fast: [
    {
      id: "fast-1",
      name: "Fast Games",
      img: "https://i.ibb.co/9yQ3PpH/onegame.png",
    },
  ],
  fish: [
    { id: "fish-1", name: "Fish", img: "https://i.ibb.co/8Y7dB3f/relax.png" },
  ],
  sportsbook: [
    {
      id: "sport-1",
      name: "Sportsbook",
      img: "https://i.ibb.co/6bJt7m4/playtech.png",
    },
  ],
};

// Badge
const Badge = ({ type }) => {
  if (!type) return null;
  const cls =
    type === "new" ? "bg-[#20c55b] text-white" : "bg-[#ff3b30] text-white";
  return (
    <span
      className={`absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-[2px] rounded-full text-[10px] font-extrabold ${cls}`}
    >
      {type.toUpperCase()}
    </span>
  );
};

const MenuItems = () => {
  const { isBangla } = useLanguage();
  const navigate = useNavigate();

  const t = useMemo(
    () => ({
      slot: isBangla ? "স্লট গেম" : "Slot",
      casino: isBangla ? "ক্যাসিনো" : "Casino",
      crash: isBangla ? "ক্র্যাশ" : "Crash",
      cricket: isBangla ? "ক্রিকেট" : "Cricket",
      table: isBangla ? "টেবিল গেম" : "Table Games",
      fast: isBangla ? "ফাস্ট" : "Fast",
      fish: isBangla ? "মাছ ধরা" : "Fish",
      sportsbook: isBangla ? "খেলার বই" : "Sportsbook",

      promotion: isBangla ? "প্রমোশন" : "Promotion",
      bettingPass: isBangla ? "বেটিং পাস" : "Betting Pass",
      superAffiliate: isBangla ? "সুপারঅ্যাফিলিয়েট" : "Super Affiliate",
      vip: "VIP",
      affiliate: isBangla ? "অ্যাফিলিয়েট" : "Affiliate",
      rewards: isBangla ? "পুরস্কার" : "Rewards",
    }),
    [isBangla],
  );

  const MENUS = useMemo(
    () => [
      { key: "slot", label: t.slot, type: "dropdown", badge: null },
      { key: "casino", label: t.casino, type: "dropdown", badge: null },
      { key: "crash", label: t.crash, type: "dropdown", badge: null },
      { key: "cricket", label: t.cricket, type: "dropdown", badge: null },
      { key: "table", label: t.table, type: "dropdown", badge: null },
      { key: "fast", label: t.fast, type: "dropdown", badge: "new" },
      { key: "fish", label: t.fish, type: "dropdown", badge: null },
      { key: "sportsbook", label: t.sportsbook, type: "dropdown", badge: null },

      {
        key: "promotion",
        label: t.promotion,
        type: "nav",
        to: "/promotions",
        badge: null,
      },
    //   {
    //     key: "bettingPass",
    //     label: t.bettingPass,
    //     type: "nav",
    //     to: "/betting-pass",
    //     badge: "hot",
    //   },
    //   {
    //     key: "superAffiliate",
    //     label: t.superAffiliate,
    //     type: "nav",
    //     to: "/super-affiliate",
    //     badge: "hot",
    //   },
      { key: "vip", label: t.vip, type: "nav", to: "/vip", badge: "new" },
      {
        key: "affiliate",
        label: t.affiliate,
        type: "nav",
        to: "/affiliate",
        badge: null,
      },
      {
        key: "rewards",
        label: t.rewards,
        type: "nav",
        to: "/rewards",
        badge: "new",
      },
    ],
    [t],
  );

  const wrapRef = useRef(null);
  const [openKey, setOpenKey] = useState(null);
  const closeTimer = useRef(null);

  const openMenu = (key) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenKey(key);
  };

  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenKey(null), 120);
  };

  // outside click close
  useEffect(() => {
    const onOutside = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpenKey(null);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    // ✅ parent must be relative to position dropdown absolute
    <div className="hidden lg:block relative" ref={wrapRef}>
      {/* Dark bar */}
      <div className="w-full bg-[#3e3e3e] relative z-[60]">
        <div className="mx-auto px-3">
          <div className="flex items-center gap-2">
            {MENUS.map((m) => {
              if (m.type === "dropdown") {
                const isOpen = openKey === m.key;
                return (
                  <div
                    key={m.key}
                    className="relative"
                    onMouseEnter={() => openMenu(m.key)}
                    onMouseLeave={closeMenu}
                  >
                    <button
                      type="button"
                      className={[
                        "relative h-[56px] px-4",
                        "text-[14px] font-bold",
                        "text-white/90 hover:text-white",
                        isOpen ? "bg-black/35" : "bg-transparent",
                      ].join(" ")}
                    >
                      {m.label}
                      <Badge type={m.badge} />
                    </button>
                  </div>
                );
              }

              return (
                <div key={m.key} className="relative">
                  <NavLink
                    to={m.to}
                    className={({ isActive }) =>
                      [
                        "relative inline-flex items-center",
                        "h-[56px] px-4",
                        "text-[14px] font-bold",
                        isActive
                          ? "bg-[#f5b400] text-black"
                          : "text-white/90 hover:text-white",
                      ].join(" ")
                    }
                  >
                    {m.label}
                    <Badge type={m.badge} />
                  </NavLink>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ✅ Floating Mega Dropdown (ABSOLUTE overlay, transparent bg) */}
      <AnimatePresence>
        {openKey ? (
          <motion.div
            key="mega"
            onMouseEnter={() => openMenu(openKey)}
            onMouseLeave={closeMenu}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="
              absolute left-0  w-full
              z-[55]
              pointer-events-auto
            "
          >
            {/* Transparent overlay area */}
            <div className="w-full">
              <div className="mx-auto ">
                {/* Panel (semi transparent + blur) */}
                <div className=" border border-white/10 bg-black/35 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
                  <div className="p-5 max-w-7xl mx-auto">
                    <div className="grid grid-cols-6 gap-4">
                      {(PROVIDERS[openKey] || []).map((p) => (
                        <motion.button
                          key={p.id}
                          whileHover={{ y: -3, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => {
                            setOpenKey(null);
                            navigate(`/play/${p.id}`);
                          }}
                          className={[
                            "group relative overflow-hidden rounded-xl",
                            "bg-white/5 border border-white/10",
                            "hover:border-[#f5b400]/60 hover:bg-white/10",
                            "transition",
                          ].join(" ")}
                          title={p.name}
                        >
                          <div className="p-3">
                            <div className="aspect-[1/1] w-full rounded-lg overflow-hidden bg-black/20">
                              <img
                                src={p.img}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://i.ibb.co/2Sg9P4w/inout.png";
                                }}
                              />
                            </div>

                            <div className="mt-2 text-center">
                              <p className="text-xs font-extrabold text-white/85 group-hover:text-white">
                                {p.name}
                              </p>
                            </div>
                          </div>

                          {/* glow */}
                          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                            <div className="absolute -inset-8 bg-[radial-gradient(circle_at_center,rgba(245,180,0,0.25),transparent_60%)]" />
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <div className="mt-5 h-px bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default MenuItems;
