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
    queryFn: async () => {
      const res = await api.get("/api/aff-agent");
      return res.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

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

  const sk = {
    baseColor: "#3a3a3a",
    highlightColor: "#4a4a4a",
  };

  return (
    <section className="w-full bg-[#2b2b2b] text-white py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {isLoading ? (
          // ── Loading Skeleton ───────────────────────────────────────
          <div className="space-y-10">
            {/* Title skeleton */}
            <div className="flex justify-center">
              <Skeleton {...sk} width={320} height={40} borderRadius={8} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              {/* Left column skeleton */}
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

              {/* Right yellow card skeleton */}
              <div className="bg-[#f5b400] rounded-lg shadow-[0_8px_20px_rgba(0,0,0,0.45)] border border-black/10 p-6 sm:p-8">
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
          // ── Real content ───────────────────────────────────────────
          <>
            <h2 className="text-center text-2xl sm:text-3xl font-extrabold mb-8 sm:mb-10">
              {t.title}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
              {/* LEFT SIDE */}
              <div className="space-y-5">
                <p className="text-sm sm:text-base leading-relaxed text-white/95">
                  {t.p1}
                </p>

                <p className="text-sm sm:text-base leading-relaxed text-white/95">
                  {t.p2}
                </p>

                <ul className="space-y-3 pt-2">
                  {t.list.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-sm bg-green-500">
                        <Check size={16} className="text-white" />
                      </span>
                      <span className="text-sm sm:text-base leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="text-sm sm:text-base leading-relaxed pt-2 text-white/95">
                  {t.p3}
                </p>
              </div>

              {/* RIGHT SIDE (yellow card) */}
              <div className="bg-[#f5b400] rounded-lg shadow-[0_8px_20px_rgba(0,0,0,0.45)] border border-black/10 p-6 sm:p-8 flex items-center justify-center">
                <div className="w-full max-w-md text-center">
                  <div className="text-[56px] sm:text-[72px] font-extrabold text-black leading-none">
                    {t.percentText}
                  </div>

                  <div className="mt-3 inline-block px-4 sm:px-6 py-2">
                    <span className="text-white font-extrabold text-lg sm:text-2xl tracking-wide">
                      {t.strip}
                    </span>
                  </div>

                  <div className="mt-6">
                    <Link
                      to={t.btnLink || "/register"}
                      className="inline-block bg-black text-white font-bold px-6 sm:px-8 py-3 rounded-md hover:bg-[#1f1f1f] transition"
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
