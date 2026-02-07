import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../../Context/LanguageProvider";

// ✅ Demo provider images (তুমি পরে real image বসাবে)
const PROVIDERS = {
  slot: [
    {
      id: "jili",
      name: "JILI",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/aNJOerVVQkubX6fla08q94flSi1TJB50WTaFNpVC.png",
    },
    {
      id: "pg",
      name: "PG",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/3qiY2geP8G221Ud6zB5yxVlAoUzOpHFYD8ipLWoz.png",
    },
    {
      id: "inout",
      name: "INOUT",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/UHXACNNM1DBPatlH1u39P2N8Xp497h70g6LkVFh9.png",
    },
    {
      id: "winspinity",
      name: "Winspinity",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/aMXdTiIdARFCVBmSuqp0e3SFOZmHnsOqyPvQfU10.png",
    },
    {
      id: "jdb",
      name: "JDB",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/FIS6fMldZFwpzL5HvXez8hWvPWHRvnpaa863glpm.png",
    },
    {
      id: "bng",
      name: "BNG",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/uZeMqebF1pY4hyhI09nNJl8JPUdObpTZK8TNKRmn.png",
    },
    {
      id: "habanero",
      name: "Habanero",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/hRJKCIGfsKom04Ok44tFzyyHLxOTDSPXvPTQAvx6.jpg",
    },
    {
      id: "smartsoft",
      name: "SmartSoft",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/XKMsslvB0bgiBJ41meWZH3mO02J0ysgOdnE8WMc5.jpg",
    },
    {
      id: "gambit",
      name: "Gambit",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/hRWrzomQ5kEifPSkA7bYLWT7fahUHvakaLyvA4th.jpg",
    },
    {
      id: "million",
      name: "Million",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/f2nWuCXKcdgH6K7sC8dGxzX8ALgAqvjPLnCaI9sm.jpg",
    },
    {
      id: "pragmatic",
      name: "Pragmatic Play",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/Cg4lgL5AQ5VS2uwhKGamGKwqSPbK7Xcj99bSWTno.jpg",
    },
    {
      id: "spade",
      name: "Spadegaming",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/3Y8aCs6xtWTxk6xtaxnkS9Zk7qAsOsvhgc0Jg0me.jpg",
    },
    {
      id: "playngo",
      name: "Play'n GO",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/ad5CfULwpWYJ0qyEtT3a8Djc5eCghQwroEo1vLrv.jpg",
    },
    {
      id: "redtiger",
      name: "Red Tiger",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/1JbjzqcccNub15FEa8NFG8nBQbSqeO4Lzo3t33ad.jpg",
    },
    {
      id: "microgaming",
      name: "Microgaming",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/9C93WgGFt5Hu2d4Zy8Oi4ZOTN4AfwpZ5YUFF1VRj.jpg",
    },
    {
      id: "onegame",
      name: "OneGame",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/Msd4TdpRpg3WVJ92WgAFEF2ya5Tse1vmUWzLwFl5.png",
    },
    {
      id: "playtech",
      name: "Playtech",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/MXwTdiEJPVWU71nSJPlApAKtRqylFTXaaleP1jXi.png",
    },
    {
      id: "relax",
      name: "Relax Gaming",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/MpWNkkw9jLLG4DNj15Wwj7Bk2DUBgVvBrWl6INM2.png",
    },
    {
      id: "netent",
      name: "NetEnt",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/2NRSErKoMEtUKjscmP3joLhsmA9CQGuitXVXnw2T.png",
    },
    {
      id: "nolimit",
      name: "NoLimit",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/6V8M4TwJerxSH6sohn9wER6kxrnJ7Oio0Z5hsvbB.png",
    },
  ],
  casino: [
    {
      id: "evolution",
      name: "Evolution",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/JLeiXnqnwXlBOutJPWhmCwbJIrScgsYItaystVbT.png",
    },
    {
      id: "pragmatic-live",
      name: "Pragmatic Live",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/2U2R12bOlHk7ZSnTSWlIA2iYii38jEX6n7D53KGV.png",
    },
    {
      id: "ezugi",
      name: "Ezugi",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/JVBrcYTOK5fBcqdSCOM1U8751fIAgF7WICtNyzNd.png",
    },
  ],
  crash: [
    {
      id: "spribe",
      name: "SPRIBE",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/kHAls9yoO4bW6G0waAlr4s8qSuOLSMuE4l0ahtjy.png",
    },
    {
      id: "smartsoft-crash",
      name: "SmartSoft",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/setting/j1Wsrf65POcVebSWX2lFMmGgonc1uvrB6pEtGX5q.png",
    },
  ],
  cricket: [
    {
      id: "cricket-1",
      name: "Cricket",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/cRLkkUpTuq54uvS473Qc08xmKLVzDyr810ShJ0AS.png",
    },
  ],
  table: [
    {
      id: "table-1",
      name: "Table Games",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/5oT0jy6Hf6siJuEF9GsMZqz3crTXQikKB0cvBbbB.png",
    },
  ],
  fast: [
    {
      id: "fast-1",
      name: "Fast Games",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/vbGv3pZBg8wcPb3vXgN4oDMlgkuP1fdMwlqIwAuu.png",
    },
  ],
  fish: [
    {
      id: "fish-1",
      name: "Fish",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/UBTiSJcubDayg2OB4ZcgLVQ1JlIX45Wnb3wEJ3iJ.png",
    },
  ],
  sportsbook: [
    {
      id: "sport-1",
      name: "Sportsbook",
      img: "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/AQLWXaYirseyIlqooFPuBtcbWxTXW4uj6w4RMo1h.png",
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
      slot: isBangla ? "স্লট" : "Slot",
      casino: isBangla ? "ক্যাসিনো" : "Casino",
      crash: isBangla ? "ক্র্যাশ" : "Crash",
      cricket: isBangla ? "ক্রিকেট" : "Cricket",
      table: isBangla ? "টেবিল" : "Table",
      fast: isBangla ? "ফাস্ট" : "Fast",
      fish: isBangla ? "মাছ" : "Fish",
      sportsbook: isBangla ? "বই" : "Book",

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
              <div className="mx-auto">
                {/* Panel (semi transparent + blur) */}
                <div className=" border border-white/10 bg-black/35 shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
                  <div className="p-5 max-w-6xl mx-auto">
                    <div className="grid grid-cols-5 gap-8">
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
                          <div>
                            <div className="aspect-[1/1] w-full">
                              <img
                                src={p.img}
                                alt={p.name}
                                className="w-full h-66 cursor-pointer object-cover"
                                loading="lazy"
                              />
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
