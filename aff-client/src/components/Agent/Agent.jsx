import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Agent = () => {
  const { isBangla } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["aff-agent"],
    queryFn: async () => (await api.get("/api/aff-agent")).data,
    staleTime: 60_000,
    retry: 1,
  });

  // ✅ UI config
  const { data: cfg } = useQuery({
    queryKey: ["aff-agent-color"],
    queryFn: async () => (await api.get("/api/aff-agent-color")).data,
    staleTime: 60_000,
    retry: 1,
  });

  const c = cfg || {};
  const cssVars = {
    "--a-bg": c.sectionBg || "#2b2b2b",
    "--a-text": c.sectionText || "#ffffff",
    "--a-pady": `${c.sectionPadY ?? 56}px`,

    "--a-title": c.titleColor || "#ffffff",
    "--a-title-size": `${c.titleSize ?? 32}px`,
    "--a-title-mb": `${c.titleMarginBottom ?? 40}px`,

    "--a-para": c.paraColor || "rgba(255,255,255,0.95)",
    "--a-para-size": `${c.paraSize ?? 16}px`,

    "--a-check-bg": c.checkBg || "#22c55e",
    "--a-check-icon": c.checkIcon || "#ffffff",
    "--a-check-radius": `${c.checkRadius ?? 2}px`,

    "--a-list-text": c.listTextColor || "#ffffff",
    "--a-list-size": `${c.listTextSize ?? 16}px`,

    "--a-card-bg": c.cardBg || "#f5b400",
    "--a-card-border": c.cardBorder || "rgba(0,0,0,0.10)",
    "--a-card-radius": `${c.cardRadius ?? 8}px`,
    "--a-card-shadow": c.cardShadow || "0 8px 20px rgba(0,0,0,0.45)",

    "--a-percent": c.percentColor || "#000000",
    "--a-percent-size": `${c.percentSize ?? 72}px`,

    "--a-strip": c.stripColor || "#ffffff",
    "--a-strip-size": `${c.stripSize ?? 24}px`,

    "--a-btn-bg": c.btnBg || "#000000",
    "--a-btn-hover": c.btnHoverBg || "#1f1f1f",
    "--a-btn-text": c.btnText || "#ffffff",
    "--a-btn-size": `${c.btnTextSize ?? 16}px`,
    "--a-btn-radius": `${c.btnRadius ?? 6}px`,
  };

  const t = useMemo(() => {
    const fallback = {
      title: isBangla ? "BABU88 এজেন্ট হন!" : "Become a BABU88 Agent!",
      p1: isBangla
        ? "BABU88 বাংলাদেশের এজেন্টদের জন্য তাদের আয় বৃদ্ধির এক অনন্যসুযোগ প্রদান করে যাচ্ছে কখনও হয়নি!"
        : "BABU88 offers Bangladeshi agents a unique opportunity to increase their income like never before!",
      p2: isBangla
        ? "BABU88 এজেন্টদের সাথে যোগ দিন — আজই আপনার আয় বৃদ্ধি করুন!"
        : "Join BABU88 agents — increase your income today!",
      list: isBangla
        ? [
            "৬০% পর্যন্ত কমিশন - যা বাজারের সর্বোচ্চ",
            "সাপ্তাহিক বোনাস এবং মাসিক প্রোমো",
            "BABU LEGEND এজেন্ট লয়্যালিটি প্রোগ্রামের মাধ্যমে নতুন পুরস্কার এবং রিচার্জ উপহার",
            "অসংখ্য গেম সহ বিশ্বস্ত বেটিং প্ল্যাটফর্ম",
          ]
        : [
            "Up to 60% commission — the highest in the market",
            "Weekly bonuses and monthly promos",
            "New rewards & recharge gifts via BABU LEGEND agent loyalty program",
            "Trusted betting platform with lots of games",
          ],
      p3: isBangla
        ? "BABU88 দিয়ে আরও বেশি উপার্জন শুরু করুন — দ্রুত, সহজ এবং ফলপ্রসূ!"
        : "Start earning more with BABU88 — fast, easy, and rewarding!",
      strip: isBangla ? "পর্যন্ত কমিশন অর্জন করুন" : "Earn Commission Up To",
      btn: isBangla ? "এখনই যোগদান করুন!" : "Join Now!",
      percentText: "60%",
      btnLink: "/register",
    };

    if (isLoading || !data?._id) return fallback;

    const list = (isBangla ? data.listBn : data.listEn) || fallback.list;

    return {
      title: isBangla
        ? data.titleBn || fallback.title
        : data.titleEn || fallback.title,
      p1: isBangla ? data.p1Bn || fallback.p1 : data.p1En || fallback.p1,
      p2: isBangla ? data.p2Bn || fallback.p2 : data.p2En || fallback.p2,
      p3: isBangla ? data.p3Bn || fallback.p3 : data.p3En || fallback.p3,
      list: list?.length ? list : fallback.list,
      strip: isBangla
        ? data.stripBn || fallback.strip
        : data.stripEn || fallback.strip,
      btn: isBangla ? data.btnBn || fallback.btn : data.btnEn || fallback.btn,
      percentText: data.percentText || fallback.percentText,
      btnLink: data.btnLink || fallback.btnLink,
    };
  }, [isBangla, data, isLoading]);

  const sk = { baseColor: "#3a3a3a", highlightColor: "#4a4a4a" };

  return (
    <section
      style={cssVars}
      className="w-full text-[color:var(--a-text)] bg-[color:var(--a-bg)]"
    >
      <div
        style={{ paddingTop: "var(--a-pady)", paddingBottom: "var(--a-pady)" }}
        className="max-w-7xl mx-auto px-4 sm:px-6"
      >
        {isLoading ? (
          <div className="space-y-10">
            <div className="flex justify-center">
              <Skeleton {...sk} width={320} height={40} borderRadius={8} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              <div className="space-y-6">
                <Skeleton {...sk} height={20} count={2} />
                <div className="space-y-4 pt-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton {...sk} circle width={20} height={20} />
                      <Skeleton {...sk} height={18} width="85%" />
                    </div>
                  ))}
                </div>
                <Skeleton {...sk} height={20} />
              </div>

              <div
                className="rounded-lg border p-6 sm:p-8"
                style={{
                  background: "var(--a-card-bg)",
                  borderColor: "var(--a-card-border)",
                  boxShadow: "var(--a-card-shadow)",
                }}
              >
                <div className="text-center space-y-6">
                  <Skeleton
                    {...sk}
                    width={140}
                    height={80}
                    className="mx-auto"
                  />
                  <Skeleton
                    {...sk}
                    width={220}
                    height={28}
                    className="mx-auto"
                  />
                  <Skeleton
                    {...sk}
                    width={180}
                    height={48}
                    className="mx-auto"
                    borderRadius={6}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2
              className="text-center font-extrabold"
              style={{
                color: "var(--a-title)",
                fontSize: "var(--a-title-size)",
                marginBottom: "var(--a-title-mb)",
              }}
            >
              {t.title}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
              {/* LEFT */}
              <div className="space-y-5">
                <p
                  style={{
                    color: "var(--a-para)",
                    fontSize: "var(--a-para-size)",
                  }}
                  className="leading-relaxed"
                >
                  {t.p1}
                </p>
                <p
                  style={{
                    color: "var(--a-para)",
                    fontSize: "var(--a-para-size)",
                  }}
                  className="leading-relaxed"
                >
                  {t.p2}
                </p>

                <ul className="space-y-3 pt-2">
                  {t.list.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-5 w-5 items-center justify-center"
                        style={{
                          background: "var(--a-check-bg)",
                          borderRadius: "var(--a-check-radius)",
                        }}
                      >
                        <Check
                          size={16}
                          style={{ color: "var(--a-check-icon)" }}
                        />
                      </span>
                      <span
                        style={{
                          color: "var(--a-list-text)",
                          fontSize: "var(--a-list-size)",
                        }}
                        className="leading-relaxed"
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <p
                  style={{
                    color: "var(--a-para)",
                    fontSize: "var(--a-para-size)",
                  }}
                  className="leading-relaxed pt-2"
                >
                  {t.p3}
                </p>
              </div>

              {/* RIGHT CARD */}
              <div
                className="border p-6 sm:p-8 flex items-center justify-center"
                style={{
                  background: "var(--a-card-bg)",
                  borderColor: "var(--a-card-border)",
                  borderRadius: "var(--a-card-radius)",
                  boxShadow: "var(--a-card-shadow)",
                }}
              >
                <div className="w-full max-w-md text-center">
                  <div
                    className="font-extrabold leading-none"
                    style={{
                      color: "var(--a-percent)",
                      fontSize: "var(--a-percent-size)",
                    }}
                  >
                    {t.percentText}
                  </div>

                  <div className="mt-3 inline-block px-4 sm:px-6 py-2">
                    <span
                      className="font-extrabold tracking-wide"
                      style={{
                        color: "var(--a-strip)",
                        fontSize: "var(--a-strip-size)",
                      }}
                    >
                      {t.strip}
                    </span>
                  </div>

                  <div className="mt-6">
                    <Link
                      to={t.btnLink || "/register"}
                      className="inline-block font-bold px-6 sm:px-8 py-3 transition"
                      style={{
                        background: "var(--a-btn-bg)",
                        color: "var(--a-btn-text)",
                        fontSize: "var(--a-btn-size)",
                        borderRadius: "var(--a-btn-radius)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--a-btn-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "var(--a-btn-bg)")
                      }
                    >
                      {t.btn}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Agent;
