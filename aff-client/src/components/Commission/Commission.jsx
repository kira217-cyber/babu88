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

  // ✅ UI Color config
  const [cfg, setCfg] = useState(null);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ✅ fetch commission content
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/aff-commission/active");
        if (mounted) setData(res.data);
      } catch (e) {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ fetch color config
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/api/aff-commission-color");
        if (mounted) setCfg(res.data);
      } catch (e) {
        if (mounted) setCfg(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const c = cfg || {};
  const cssVars = {
    "--c-bg": c.sectionBg || "#2b2b2b",
    "--c-text": c.sectionText || "#ffffff",
    "--c-title": c.titleColor || "#ffffff",
    "--c-title-size": `${c.titleSize ?? 32}px`,

    "--c-tb-border": c.tableBorder || "rgba(255,255,255,0.90)",
    "--c-th-bg": c.tableHeaderBg || "#f5b400",
    "--c-th-text": c.tableHeaderText || "#000000",
    "--c-th-size": `${c.tableHeaderTextSize ?? 18}px`,

    "--c-row-bg": c.tableRowBg || "#2b2b2b",
    "--c-row-text": c.tableRowText || "#ffffff",
    "--c-row-size": `${c.tableRowTextSize ?? 16}px`,
    "--c-cell-border": c.tableCellBorder || "rgba(255,255,255,0.90)",

    "--c-btn-bg": c.btnBg || "#f5b400",
    "--c-btn-hover": c.btnHoverBg || "#e2a800",
    "--c-btn-text": c.btnText || "#000000",
    "--c-btn-size": `${c.btnTextSize ?? 16}px`,
    "--c-btn-radius": `${c.btnRadius ?? 6}px`,

    "--c-overlay": String(c.overlayOpacity ?? 0.55),

    "--c-modal-bg": c.modalBg || "#ffffff",
    "--c-modal-text": c.modalText || "#000000",
    "--c-modal-radius": `${c.modalRadius ?? 2}px`,
    "--c-modal-shadow": c.modalShadow || "0 18px 50px rgba(0,0,0,0.65)",

    "--c-modal-title": c.modalTitleColor || "#000000",
    "--c-modal-title-size": `${c.modalTitleSize ?? 40}px`,

    "--c-close-hover": c.closeHoverBg || "rgba(0,0,0,0.05)",
    "--c-close-icon": c.closeIconColor || "#000000",

    "--c-bullet": c.bulletColor || "rgba(0,0,0,0.85)",
    "--c-bullet-size": `${c.bulletSize ?? 16}px`,

    "--c-formula-title": c.formulaTitleColor || "#000000",
    "--c-formula-title-size": `${c.formulaTitleSize ?? 32}px`,

    "--c-icon-bg": c.formulaIconBg || "#f5b400",
    "--c-icon-color": c.formulaIconColor || "#ffffff",
    "--c-flabel": c.formulaLabelColor || "#000000",
    "--c-flabel-size": `${c.formulaLabelSize ?? 14}px`,

    "--c-sign": c.signColor || "#f5b400",
    "--c-sign-size": `${c.signSize ?? 40}px`,

    "--c-ex-border": c.exTableBorder || "rgba(0,0,0,0.15)",
    "--c-ex-hbg": c.exHeaderBg || "#f5b400",
    "--c-ex-ht": c.exHeaderText || "#000000",
    "--c-ex-cell": c.exCellBorder || "rgba(0,0,0,0.10)",
    "--c-ex-rbg": c.exRowBg || "#ffffff",
    "--c-ex-rt": c.exRowText || "#000000",
    "--c-ex-tbg": c.exTotalBg || "#f5b400",
    "--c-ex-tt": c.exTotalText || "#000000",
  };

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

  if (loading) {
    return (
      <section
        style={cssVars}
        className="w-full py-10 sm:py-14 text-[color:var(--c-text)] bg-[color:var(--c-bg)]"
      >
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
      <section
        style={cssVars}
        className="w-full py-10 sm:py-14 text-[color:var(--c-text)] bg-[color:var(--c-bg)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center text-xl font-extrabold">
            {isBangla ? "কমিশন ডাটা পাওয়া যায়নি" : "Commission data not found"}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      style={cssVars}
      className="w-full py-10 sm:py-14 text-[color:var(--c-text)] bg-[color:var(--c-bg)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-center font-extrabold mb-8 text-[color:var(--c-title)] text-[length:var(--c-title-size)]">
          {t.sectionTitle}
        </h2>

        <div className="w-full overflow-x-auto">
          <div
            className="min-w-[980px] border"
            style={{ borderColor: "var(--c-tb-border)" }}
          >
            <div
              className="grid grid-cols-6 font-extrabold"
              style={{
                background: "var(--c-th-bg)",
                color: "var(--c-th-text)",
                fontSize: "var(--c-th-size)",
              }}
            >
              {t.th.map((h, i) => (
                <div
                  key={i}
                  className="py-2 px-4 text-center"
                  style={{
                    borderRight:
                      i !== t.th.length - 1
                        ? `1px solid var(--c-tb-border)`
                        : undefined,
                  }}
                >
                  {h}
                </div>
              ))}
            </div>

            {t.rows.map((r, idx) => (
              <div
                key={idx}
                className="grid grid-cols-6 font-semibold"
                style={{
                  background: "var(--c-row-bg)",
                  color: "var(--c-row-text)",
                  fontSize: "var(--c-row-size)",
                }}
              >
                <Cell>{r.level}</Cell>
                <Cell>{r.newReg}</Cell>
                <Cell>{r.base}</Cell>
                <Cell>{r.extra}</Cell>
                <Cell>{r.need}</Cell>
                <Cell last>{r.total}</Cell>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={() => setOpen(true)}
            className="cursor-pointer font-extrabold px-10 py-3 transition"
            style={{
              background: "var(--c-btn-bg)",
              color: "var(--c-btn-text)",
              borderRadius: "var(--c-btn-radius)",
              fontSize: "var(--c-btn-size)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--c-btn-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--c-btn-bg)")
            }
          >
            {t.btnMore}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: Number(cssVars["--c-overlay"]) }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6"
            >
              <div
                className="w-full max-w-5xl overflow-hidden"
                style={{
                  background: "var(--c-modal-bg)",
                  color: "var(--c-modal-text)",
                  borderRadius: "var(--c-modal-radius)",
                  boxShadow: "var(--c-modal-shadow)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative px-4 sm:px-8 pt-6 sm:pt-8">
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute cursor-pointer right-3 top-3 sm:right-5 sm:top-5 p-2 rounded transition"
                    style={{ color: "var(--c-close-icon)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--c-close-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                    aria-label="Close modal"
                  >
                    <X />
                  </button>

                  <h3 className="font-extrabold mb-4 text-[color:var(--c-modal-title)] text-[length:var(--c-modal-title-size)]">
                    {t.modalTitle}
                  </h3>
                </div>

                <div className="px-4 sm:px-8 pb-8 max-h-[78vh] overflow-y-auto [scrollbar-width:none]">
                  <ul
                    className="list-disc pl-6 space-y-2"
                    style={{
                      color: "var(--c-bullet)",
                      fontSize: "var(--c-bullet-size)",
                    }}
                  >
                    {t.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>

                  <h4
                    className="font-extrabold mt-6"
                    style={{
                      color: "var(--c-formula-title)",
                      fontSize: "var(--c-formula-title-size)",
                    }}
                  >
                    {t.formulaTitle}
                  </h4>

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

                  <p className="mt-8 text-lg sm:text-xl font-extrabold">
                    {t.exampleTitle}
                  </p>

                  <div className="mt-4 w-full overflow-x-auto">
                    <div
                      className="min-w-[920px] border"
                      style={{ borderColor: "var(--c-ex-border)" }}
                    >
                      <div
                        className="grid grid-cols-6 font-extrabold text-sm sm:text-base"
                        style={{
                          background: "var(--c-ex-hbg)",
                          color: "var(--c-ex-ht)",
                        }}
                      >
                        {t.exTh.map((h, i) => (
                          <div
                            key={i}
                            className="py-3 px-3 text-center"
                            style={{
                              borderRight:
                                i !== t.exTh.length - 1
                                  ? `1px solid var(--c-ex-cell)`
                                  : undefined,
                            }}
                          >
                            {h}
                          </div>
                        ))}
                      </div>

                      {t.exRows.map((r, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-6 text-sm sm:text-base"
                          style={{
                            background: "var(--c-ex-rbg)",
                            color: "var(--c-ex-rt)",
                          }}
                        >
                          <ExCell>{r.no}</ExCell>
                          <ExCell strong>{r.wl}</ExCell>
                          <ExCell strong>{r.op}</ExCell>
                          <ExCell strong>{r.bonus}</ExCell>
                          <ExCell>{r.formula}</ExCell>
                          <ExCell strong last>
                            {r.agent}
                          </ExCell>
                        </div>
                      ))}

                      <div
                        className="grid grid-cols-6 font-extrabold"
                        style={{
                          background: "var(--c-ex-tbg)",
                          color: "var(--c-ex-tt)",
                        }}
                      >
                        <ExCell>{t.exTotalLabel}</ExCell>
                        <ExCell>{t.exTotal.wl}</ExCell>
                        <ExCell>{t.exTotal.op}</ExCell>
                        <ExCell>{t.exTotal.bonus}</ExCell>
                        <ExCell />
                        <ExCell last>{t.exTotal.agent}</ExCell>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => setOpen(false)}
                      className="cursor-pointer font-extrabold px-6 py-2 transition"
                      style={{
                        background: "var(--c-btn-bg)",
                        color: "var(--c-btn-text)",
                        borderRadius: "var(--c-btn-radius)",
                        fontSize: "var(--c-btn-size)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--c-btn-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "var(--c-btn-bg)")
                      }
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
const Cell = ({ children, last }) => (
  <div
    className={`py-4 px-2 text-center font-semibold border-t ${last ? "" : "border-r"}`}
    style={{
      borderColor: "var(--c-cell-border)",
    }}
  >
    {children}
  </div>
);

const ExCell = ({ children, strong, last }) => (
  <div
    className={`py-3 px-3 text-center border-t ${last ? "" : "border-r"}`}
    style={{
      borderColor: "var(--c-ex-cell)",
      fontWeight: strong ? 700 : 500,
    }}
  >
    {children}
  </div>
);

const FormulaItem = ({ Icon, label }) => {
  const parts = String(label || "").split("\n");
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
        style={{ background: "var(--c-icon-bg)" }}
      >
        <Icon
          className="text-white"
          size={30}
          strokeWidth={2.5}
          style={{ color: "var(--c-icon-color)" }}
        />
      </div>
      <div
        className="text-center font-bold leading-snug"
        style={{ color: "var(--c-flabel)", fontSize: "var(--c-flabel-size)" }}
      >
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
    <div
      className="font-extrabold mt-4 sm:mt-5"
      style={{ color: "var(--c-sign)", fontSize: "var(--c-sign-size)" }}
    >
      {text}
    </div>
  );
};
