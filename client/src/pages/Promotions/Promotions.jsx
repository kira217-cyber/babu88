// src/pages/Promotions.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useLanguage } from "../../Context/LanguageProvider";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const modalAnim = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const panelAnim = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
  exit: { opacity: 0, y: 14, scale: 0.985, transition: { duration: 0.15 } },
};

const Promotions = () => {
  const { isBangla } = useLanguage();

  const [activeCat, setActiveCat] = useState("all");
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ details modal
  const [selected, setSelected] = useState(null);

  const categories = useMemo(
    () => [
      { key: "all", bn: "সব", en: "All" },
      { key: "cricket", bn: "ক্রিকেট", en: "Cricket" },
      { key: "fast", bn: "ফাস্ট", en: "Fast" },
      { key: "sports", bn: "স্পোর্টস", en: "Sports" },
      { key: "livecasino", bn: "লাইভ ক্যাসিনো", en: "Live Casino" },
      { key: "slots", bn: "স্লটস", en: "Slots" },
      { key: "table", bn: "টেবিল গেমস", en: "Table Games" },
      { key: "vip", bn: "ভিআইপি", en: "VIP" },
      { key: "crash", bn: "ক্র্যাশ", en: "Crash" },
      { key: "tournament", bn: "টুর্নামেন্ট", en: "Tournament" },
    ],
    [],
  );

  // ✅ Demo promotions (+ full details for modal)
  const promotions = useMemo(
    () => [
      {
        id: 1,
        category: "cricket",
        image:
          "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80",
        title: {
          bn: "ICC T20 World Cup সাপ্তাহিক ক্যাশ ড্রপ",
          en: "ICC T20 World Cup Weekly Cash Drop",
        },
        shortDesc: {
          bn: "ICC Men’s T20 World Cup এ বেট করুন এবং প্রতি সপ্তাহে ৳৩০,০০০ পর্যন্ত জিতুন!",
          en: "Bet on ICC Men’s T20 World Cup & win up to ৳30,000 every week!",
        },
        details: {
          bn: {
            heading: "ICC T20 WORLD CUP WEEKLY CASH DROP",
            periodLabel: "প্রমোশন পিরিয়ড:",
            period:
              "FEB 10, 2026 00:00:00 (GMT +06:00) - MAR 09, 2026 23:59:59 (GMT +06:00)",
            body: [
              "এই প্রমোশনে অংশগ্রহণ করতে নির্ধারিত গেম/ক্যাটাগরিতে বেট করুন।",
              "সাপ্তাহিক ভিত্তিতে ক্যাশ ড্রপ বিতরণ হবে (ডেমো টেক্সট)।",
              "ক্যাশ ড্রপ/বোনাস আপনার অ্যাকাউন্টে অটো ক্রেডিট হতে পারে (ডেমো)।",
              "শর্ত প্রযোজ্য।",
            ],
          },
          en: {
            heading: "ICC T20 WORLD CUP WEEKLY CASH DROP",
            periodLabel: "PROMOTION PERIOD:",
            period:
              "FEB 10, 2026 00:00:00 (GMT +06:00) - MAR 09, 2026 23:59:59 (GMT +06:00)",
            body: [
              "To participate, place bets on the specified games/categories.",
              "Weekly cash drop will be distributed (demo text).",
              "Cash drop/bonus may be auto credited to your account (demo).",
              "Terms & conditions apply.",
            ],
          },
        },
      },
      {
        id: 2,
        category: "cricket",
        image:
          "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1600&q=80",
        title: {
          bn: "ICC T20 Worldcup 8.88% সাপ্তাহিক ক্যাশব্যাক",
          en: "ICC T20 Worldcup 8.88% Weekly Cashback",
        },
        shortDesc: {
          bn: "ICC T20 World Cup এ 8.88% সাপ্তাহিক ক্যাশব্যাক উপভোগ করুন!",
          en: "Enjoy 8.88% Weekly Cashback this ICC T20 World Cup!",
        },
        details: {
          bn: {
            heading: "ICC T20 WORLDCUP 8.88% WEEKLY CASHBACK",
            periodLabel: "প্রমোশন পিরিয়ড:",
            period:
              "FEB 10, 2026 00:00:00 (GMT +06:00) - MAR 09, 2026 23:59:59 (GMT +06:00)",
            body: [
              "নির্ধারিত ক্যাটাগরিতে বেট/টার্নওভার হলে ক্যাশব্যাক প্রযোজ্য (ডেমো)।",
              "সপ্তাহ শেষে ক্যাশব্যাক ক্যালকুলেশন হবে (ডেমো)।",
              "ক্যাশব্যাক % পরিবর্তন হতে পারে (ডেমো)।",
              "শর্ত প্রযোজ্য।",
            ],
          },
          en: {
            heading: "ICC T20 WORLDCUP 8.88% WEEKLY CASHBACK",
            periodLabel: "PROMOTION PERIOD:",
            period:
              "FEB 10, 2026 00:00:00 (GMT +06:00) - MAR 09, 2026 23:59:59 (GMT +06:00)",
            body: [
              "Cashback applies based on eligible turnover in selected categories (demo).",
              "Cashback will be calculated at the end of the week (demo).",
              "Cashback percentage may change (demo).",
              "Terms & conditions apply.",
            ],
          },
        },
      },
      {
        id: 3,
        category: "slots",
        image:
          "https://images.unsplash.com/photo-1518544887879-7f4b901b67b1?auto=format&fit=crop&w=1600&q=80",
        title: { bn: "স্লটস উইকেন্ড বোনাস", en: "Slots Weekend Bonus" },
        shortDesc: {
          bn: "উইকেন্ডে স্লটস খেলুন, অতিরিক্ত বোনাস ক্লেইম করুন!",
          en: "Play slots on weekends and claim extra bonus!",
        },
        details: {
          bn: {
            heading: "SLOTS WEEKEND BONUS",
            periodLabel: "প্রমোশন পিরিয়ড:",
            period: "Every Weekend (GMT +06:00) (Demo)",
            body: [
              "শুক্র-শনিবার স্লটস খেললে বোনাস যোগ হবে (ডেমো)।",
              "বোনাস তুলতে শর্ত পূরণ লাগতে পারে (ডেমো)।",
              "শর্ত প্রযোজ্য।",
            ],
          },
          en: {
            heading: "SLOTS WEEKEND BONUS",
            periodLabel: "PROMOTION PERIOD:",
            period: "Every Weekend (GMT +06:00) (Demo)",
            body: [
              "Bonus will be added for playing slots on Fri-Sat (demo).",
              "Wagering requirements may apply (demo).",
              "Terms & conditions apply.",
            ],
          },
        },
      },
      {
        id: 4,
        category: "livecasino",
        image:
          "https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1600&q=80",
        title: { bn: "লাইভ ক্যাসিনো ক্যাশব্যাক", en: "Live Casino Cashback" },
        shortDesc: {
          bn: "লাইভ ক্যাসিনোতে খেলুন এবং নির্দিষ্ট রেটে ক্যাশব্যাক পান!",
          en: "Play Live Casino and get cashback at a fixed rate!",
        },
        details: {
          bn: {
            heading: "LIVE CASINO CASHBACK",
            periodLabel: "প্রমোশন পিরিয়ড:",
            period: "FEB 10, 2026 - MAR 09, 2026 (GMT +06:00) (Demo)",
            body: [
              "লাইভ ক্যাসিনোতে নির্দিষ্ট গেমে ক্যাশব্যাক প্রযোজ্য (ডেমো)।",
              "সপ্তাহ/দৈনিক সেটেলমেন্ট হতে পারে (ডেমো)।",
              "শর্ত প্রযোজ্য।",
            ],
          },
          en: {
            heading: "LIVE CASINO CASHBACK",
            periodLabel: "PROMOTION PERIOD:",
            period: "FEB 10, 2026 - MAR 09, 2026 (GMT +06:00) (Demo)",
            body: [
              "Cashback applies on selected live casino games (demo).",
              "Settlement may be weekly/daily (demo).",
              "Terms & conditions apply.",
            ],
          },
        },
      },
    ],
    [],
  );

  const filtered = useMemo(() => {
    if (activeCat === "all") return promotions;
    return promotions.filter((p) => p.category === activeCat);
  }, [activeCat, promotions]);

  const activeLabel = useMemo(() => {
    const found = categories.find((c) => c.key === activeCat) || categories[0];
    return isBangla ? found.bn : found.en;
  }, [activeCat, categories, isBangla]);

  const t = useMemo(
    () => ({
      pageTitle: isBangla ? "প্রমোশন" : "Promotions",
      more: isBangla ? "আরো দেখুন" : "More Details",
      emptyTitle: isBangla ? "কোনো প্রমোশন নেই" : "No promotions found",
      emptyDesc: isBangla
        ? "এই ক্যাটাগরিতে এখন কোনো প্রমোশন পাওয়া যাচ্ছে না।"
        : "No promotions are available under this category right now.",
      close: isBangla ? "বন্ধ" : "Close",
    }),
    [isBangla],
  );

  const selectCat = (key) => {
    setActiveCat(key);
    setMobileOpen(false);
  };

  const openDetails = (item) => setSelected(item);
  const closeDetails = useCallback(() => setSelected(null), []);

  // ✅ ESC close + body scroll lock
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeDetails();
    };

    if (selected) {
      document.addEventListener("keydown", onKeyDown);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prev;
      };
    }
  }, [selected, closeDetails]);

  const getDetails = (item) => (isBangla ? item.details.bn : item.details.en);

  return (
    <div className="w-full bg-[#f4f5f7]">
      <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
        {/* title */}
        <div className="mb-3 sm:mb-5">
          <h2 className="text-[18px] sm:text-[22px] font-extrabold text-[#0f172a]">
            {t.pageTitle}
          </h2>
        </div>

        {/* desktop chips */}
        <div className="hidden sm:block w-full bg-[#f1f1f1] rounded-2xl p-2 sm:p-3 overflow-x-auto">
          <div className="flex items-center gap-3 min-w-max">
            {categories.map((c) => {
              const active = activeCat === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCat(c.key)}
                  className={[
                    "px-5 py-2 cursor-pointer rounded-full text-sm font-bold whitespace-nowrap transition",
                    active
                      ? "bg-[#f6c400] text-black shadow-[0_10px_20px_rgba(246,196,0,0.25)]"
                      : "bg-transparent text-[#111827] hover:bg-white/70",
                  ].join(" ")}
                >
                  {isBangla ? c.bn : c.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* mobile dropdown */}
        <div className="sm:hidden mt-1">
          <div className="relative inline-block">
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="bg-[#0b74ff] text-white font-extrabold text-sm px-5 py-2 rounded-md shadow-[0_10px_20px_rgba(11,116,255,0.22)] flex items-center gap-3"
            >
              {activeLabel}
              <FaChevronDown className="text-white/90 text-xs" />
            </button>

            <AnimatePresence>
              {mobileOpen && (
                <>
                  <motion.button
                    type="button"
                    aria-label="close dropdown"
                    className="fixed inset-0 z-[50] bg-transparent"
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.div
                    className="absolute left-0 mt-2 z-[60] w-[220px] bg-white rounded-xl border border-black/10 overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {categories.map((c) => {
                      const active = activeCat === c.key;
                      return (
                        <button
                          key={c.key}
                          onClick={() => selectCat(c.key)}
                          className={[
                            "w-full text-left px-4 py-3 text-sm font-extrabold transition",
                            active
                              ? "bg-[#f6c400] text-black"
                              : "bg-white text-[#111827] hover:bg-[#f4f5f7]",
                          ].join(" ")}
                        >
                          {isBangla ? c.bn : c.en}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* cards */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                variants={fade}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-6 border border-black/5"
              >
                <p className="text-lg font-extrabold text-[#0f172a]">
                  {t.emptyTitle}
                </p>
                <p className="mt-1 text-sm text-[#475569]">{t.emptyDesc}</p>
              </motion.div>
            ) : (
              filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  variants={fade}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: 8 }}
                  className="bg-white rounded-md overflow-hidden border border-black/5"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                >
                  <div className="p-4 sm:p-5">
                    <div className="rounded-md overflow-hidden bg-black/5">
                      <img
                        src={item.image}
                        alt={isBangla ? item.title.bn : item.title.en}
                        className="w-full h-[180px] sm:h-[220px] md:h-[240px] object-cover"
                        loading="lazy"
                        draggable="false"
                      />
                    </div>

                    <h3 className="mt-4 text-[16px] sm:text-[17px] font-extrabold text-[#0f172a] uppercase">
                      {isBangla ? item.title.bn : item.title.en}
                    </h3>
                    <p className="mt-2 text-sm text-[#475569] line-clamp-2">
                      {isBangla ? item.shortDesc.bn : item.shortDesc.en}
                    </p>

                    <div className="mt-5">
                      <button
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0b74ff] text-white font-extrabold text-sm hover:bg-[#0a66e0] transition"
                        onClick={() => openDetails(item)}
                      >
                        {t.more}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ✅ Details Modal (same to same like screenshot) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center px-2 sm:px-6"
            variants={modalAnim}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {/* overlay */}
            <motion.button
              type="button"
              aria-label="Close modal"
              className="absolute inset-0 bg-black/45"
              onClick={closeDetails}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* panel */}
            <motion.div
              className="relative w-full max-w-[980px] bg-white rounded-sm overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.35)]"
              variants={panelAnim}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {/* close (yellow square top-right like screenshot) */}
              <button
                type="button"
                onClick={closeDetails}
                className="absolute top-0 right-0 z-20 w-10 h-10 bg-[#f6c400] flex items-center justify-center hover:brightness-95 transition"
                aria-label={t.close}
                title={t.close}
              >
                <IoClose className="text-black text-[22px]" />
              </button>

              {/* scroll body */}
              <div className="max-h-[85vh] overflow-y-auto">
                {/* image */}
                <div className="p-3 sm:p-4">
                  <div className="rounded-sm overflow-hidden">
                    <img
                      src={selected.image}
                      alt={isBangla ? selected.title.bn : selected.title.en}
                      className="w-full  h-[200px] md:h-[400px] block"
                      draggable="false"
                    />
                  </div>

                  {/* details area */}
                  <div className="mt-4 px-1 sm:px-0">
                    <h3 className="text-[16px] sm:text-[18px] font-extrabold text-[#111827] uppercase">
                      {getDetails(selected).heading}
                    </h3>

                    <div className="mt-4">
                      <p className="text-[13px] font-extrabold text-[#111827] uppercase">
                        {getDetails(selected).periodLabel}
                      </p>
                      <p className="mt-2 text-[13px] text-[#111827] font-semibold">
                        {getDetails(selected).period}
                      </p>
                    </div>

                    <div className="mt-4 space-y-2">
                      {getDetails(selected).body.map((line, idx) => (
                        <p key={idx} className="text-[13px] text-[#111827]">
                          • {line}
                        </p>
                      ))}
                    </div>

                    <div className="h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Promotions;
