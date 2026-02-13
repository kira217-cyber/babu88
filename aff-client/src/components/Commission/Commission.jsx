import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  BadgeDollarSign,
  Calculator,
  DollarSign,
  BarChart3,
  Wallet,
} from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";


const Commission = () => {
  const { isBangla } = useLanguage();
  const [open, setOpen] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ✅ fetch active config
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/aff-commission/active");
        if (mounted) setData(res.data);
      } catch (e) {
        // fallback null থাকলে UI লোডিং দেখাবে
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ language picker helper
  const pick = (bi) => (isBangla ? bi?.bn : bi?.en);

  const t = useMemo(() => {
    if (!data) return null;

    return {
      sectionTitle: pick(data.sectionTitle),
      btnMore: pick(data.btnMore),

      th: isBangla ? data.th?.bn || [] : data.th?.en || [],
      rows: (data.rows || []).map((r) => ({
        level: r.level,
        newReg: pick(r.newReg),
        base: r.base,
        extra: r.extra,
        need: pick(r.need),
        total: r.total,
      })),

      modalTitle: pick(data.modalTitle),
      bullets: isBangla ? data.bullets?.bn || [] : data.bullets?.en || [],

      formulaTitle: pick(data.formulaTitle),
      formulaLabels: isBangla
        ? data.formulaLabels?.bn || []
        : data.formulaLabels?.en || [],

      exampleTitle: pick(data.exampleTitle),

      exTh: isBangla ? data.exTh?.bn || [] : data.exTh?.en || [],
      exRows: (data.exRows || []).map((r) => ({
        no: r.no,
        wl: r.wl,
        op: r.op,
        bonus: r.bonus,
        formula: pick(r.formula),
        agent: r.agent,
      })),

      exTotalLabel: pick(data.exTotalLabel),
      exTotal: data.exTotal || { wl: "", op: "", bonus: "", agent: "" },

      close: pick(data.close),
    };
  }, [data, isBangla]);

  // loading / no data
  if (loading) {
    return (
      <section className="w-full bg-[#2b2b2b] py-10 sm:py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center text-xl font-extrabold">
            {isBangla ? "লোড হচ্ছে..." : "Loading..."}
          </div>
        </div>
      </section>
    );
  }

  if (!t) {
    return (
      <section className="w-full bg-[#2b2b2b] py-10 sm:py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center text-xl font-extrabold">
            {isBangla ? "কমিশন ডাটা পাওয়া যায়নি" : "Commission data not found"}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#2b2b2b] py-10 sm:py-14 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold mb-8">
          {t.sectionTitle}
        </h2>

        {/* Table wrapper (responsive) */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[980px] border border-white/90">
            {/* Header */}
            <div className="grid grid-cols-6 bg-[#f5b400] text-black font-extrabold text-base">
              {t.th.map((h, i) => (
                <div
                  key={i}
                  className={`py-2 px-4 text-center text-lg ${
                    i !== t.th.length - 1 ? "border-r border-white/90" : ""
                  }`}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Body */}
            {t.rows.map((r, idx) => (
              <div
                key={idx}
                className="grid grid-cols-6 bg-[#2b2b2b] text-white font-semibold"
              >
                <div className="py-4 px-2 border-t border-r border-white/90 text-center font-semibold">
                  {r.level}
                </div>
                <div className="py-4 px-2 border-t border-r border-white/90 text-center font-semibold">
                  {r.newReg}
                </div>
                <div className="py-4 px-2 border-t border-r border-white/90 text-center font-semibold">
                  {r.base}
                </div>
                <div className="py-4 px-2 border-t border-r border-white/90 text-center font-semibold">
                  {r.extra}
                </div>
                <div className="py-4 px-2 border-t border-r border-white/90 text-center font-semibold">
                  {r.need}
                </div>
                <div className="py-4 border-t border-white/90 text-center font-semibold">
                  {r.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setOpen(true)}
            className="bg-[#f5b400] cursor-pointer text-black font-extrabold px-10 py-3 rounded-md hover:bg-[#e2a800] transition"
          >
            {t.btnMore}
          </button>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {open && (
          <>
            {/* overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />

            {/* modal wrapper */}
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6"
            >
              {/* modal box */}
              <div
                className="w-full max-w-5xl bg-white text-black rounded-sm shadow-[0_18px_50px_rgba(0,0,0,0.65)] overflow-hidden "
                onClick={(e) => e.stopPropagation()}
              >
                {/* header */}
                <div className="relative px-4 sm:px-8 pt-6 sm:pt-8">
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute cursor-pointer right-3 top-3 sm:right-5 sm:top-5 p-2 rounded hover:bg-black/5 transition"
                    aria-label="Close modal"
                  >
                    <X className="text-black" />
                  </button>

                  <h3 className="text-3xl sm:text-4xl font-extrabold mb-4">
                    {t.modalTitle}
                  </h3>
                </div>

                {/* content scroll area */}
                <div className="px-4 sm:px-8 pb-8 max-h-[78vh] overflow-y-auto [scrollbar-width:none]">
                  {/* bullets */}
                  <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-black/85">
                    {t.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>

                  {/* formula title */}
                  <h4 className="text-2xl sm:text-3xl font-extrabold mt-6">
                    {t.formulaTitle}
                  </h4>

                  {/* formula icons row */}
                  <div className="mt-6 flex flex-wrap items-start justify-center gap-5 sm:gap-7">
                    <FormulaItem Icon={User} label={t.formulaLabels[0]} />
                    <Sign />
                    <FormulaItem
                      Icon={BadgeDollarSign}
                      label={t.formulaLabels[1]}
                    />
                    <Sign />
                    <FormulaItem Icon={Calculator} label={t.formulaLabels[2]} />
                    <Sign equal />
                    <FormulaItem Icon={DollarSign} label={t.formulaLabels[3]} />
                    <Sign multiply />
                    <FormulaItem Icon={BarChart3} label={t.formulaLabels[4]} />
                    <Sign equal />
                    <FormulaItem Icon={Wallet} label={t.formulaLabels[5]} />
                  </div>

                  {/* example title */}
                  <p className="mt-8 text-lg sm:text-xl font-extrabold">
                    {t.exampleTitle}
                  </p>

                  {/* example table */}
                  <div className="mt-4 w-full overflow-x-auto">
                    <div className="min-w-[920px] border border-black/15">
                      {/* header row */}
                      <div className="grid grid-cols-6 bg-[#f5b400] text-black font-extrabold text-sm sm:text-base">
                        {t.exTh.map((h, i) => (
                          <div
                            key={i}
                            className={`py-3 px-3 text-center ${
                              i !== t.exTh.length - 1
                                ? "border-r border-black/10"
                                : ""
                            }`}
                          >
                            {h}
                          </div>
                        ))}
                      </div>

                      {/* data rows */}
                      {t.exRows.map((r, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-6 bg-white text-black text-sm sm:text-base"
                        >
                          <div className="py-3 px-3 text-center border-t border-r border-black/10">
                            {r.no}
                          </div>
                          <div className="py-3 px-3 text-center border-t border-r border-black/10 font-semibold">
                            {r.wl}
                          </div>
                          <div className="py-3 px-3 text-center border-t border-r border-black/10 font-semibold">
                            {r.op}
                          </div>
                          <div className="py-3 px-3 text-center border-t border-r border-black/10 font-semibold">
                            {r.bonus}
                          </div>
                          <div className="py-3 px-3 text-center border-t border-r border-black/10">
                            {r.formula}
                          </div>
                          <div className="py-3 px-3 text-center border-t border-black/10 font-semibold">
                            {r.agent}
                          </div>
                        </div>
                      ))}

                      {/* total row */}
                      <div className="grid grid-cols-6 bg-[#f5b400] text-black font-extrabold">
                        <div className="py-4 px-3 text-center border-t border-r border-black/10">
                          {t.exTotalLabel}
                        </div>
                        <div className="py-4 px-3 text-center border-t border-r border-black/10">
                          {t.exTotal.wl}
                        </div>
                        <div className="py-4 px-3 text-center border-t border-r border-black/10">
                          {t.exTotal.op}
                        </div>
                        <div className="py-4 px-3 text-center border-t border-r border-black/10">
                          {t.exTotal.bonus}
                        </div>
                        <div className="py-4 px-3 text-center border-t border-r border-black/10"></div>
                        <div className="py-4 px-3 text-center border-t border-black/10">
                          {t.exTotal.agent}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* close button */}
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => setOpen(false)}
                      className="bg-[#f5b400] cursor-pointer text-black font-extrabold px-6 py-2 rounded-md hover:bg-[#e2a800] transition"
                    >
                      {t.close}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Commission;

/* helpers */

const FormulaItem = ({ Icon, label }) => {
  const parts = String(label || "").split("\n");
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#f5b400] flex items-center justify-center">
        <Icon className="text-white" size={30} strokeWidth={2.5} />
      </div>
      <div className="text-center text-xs sm:text-sm font-bold leading-snug">
        {parts.map((p, i) => (
          <div key={i}>{p}</div>
        ))}
      </div>
    </div>
  );
};

const Sign = ({ equal, multiply }) => {
  const text = equal ? "=" : multiply ? "×" : "−";
  return (
    <div className="text-3xl sm:text-4xl font-extrabold text-[#f5b400] mt-4 sm:mt-5">
      {text}
    </div>
  );
};
