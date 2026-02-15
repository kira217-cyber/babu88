import React, { useMemo } from "react";
import { DollarSign, Lock, Smartphone, BarChart3 } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ICONS = [DollarSign, Lock, Smartphone, BarChart3];

const WhyUs = () => {
  const { isBangla } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["aff-whyus"],
    queryFn: async () => (await api.get("/api/aff-whyus")).data,
    staleTime: 60_000,
    retry: 1,
  });

  // ✅ UI config
  const { data: cfg } = useQuery({
    queryKey: ["aff-whyus-color"],
    queryFn: async () => (await api.get("/api/aff-whyus-color")).data,
    staleTime: 60_000,
    retry: 1,
  });

  const c = cfg || {};
  const cssVars = {
    "--w-bg": c.sectionBg || "#2b2b2b",
    "--w-pady": `${c.sectionPadY ?? 56}px`,

    "--w-title": c.titleColor || "#ffffff",
    "--w-title-size": `${c.titleSize ?? 32}px`,
    "--w-title-mb": `${c.titleMarginBottom ?? 40}px`,

    "--w-card-bg": c.cardBg || "#ffffff",
    "--w-card-border": c.cardBorder || "rgba(0,0,0,0.10)",
    "--w-card-radius": `${c.cardRadius ?? 6}px`,
    "--w-card-shadow": c.cardShadow || "0 10px 25px rgba(0,0,0,0.25)",
    "--w-card-padx": `${c.cardPadX ?? 40}px`,
    "--w-card-pady": `${c.cardPadY ?? 40}px`,

    "--w-gap": `${c.gridGap ?? 40}px`,

    "--w-ic-bg": c.iconCircleBg || "#f5b400",
    "--w-ic-size": `${c.iconCircleSize ?? 96}px`,
    "--w-ic-overlay": c.iconOverlay || "rgba(0,0,0,0.10)",
    "--w-ic-color": c.iconColor || "#ffffff",
    "--w-ic-icon": `${c.iconSize ?? 42}px`,

    "--w-it-title": c.itemTitleColor || "#000000",
    "--w-it-title-size": `${c.itemTitleSize ?? 18}px`,
    "--w-it-title-mb": `${c.itemTitleMarginBottom ?? 12}px`,

    "--w-desc": c.descColor || "rgba(0,0,0,0.80)",
    "--w-desc-size": `${c.descSize ?? 14}px`,
    "--w-desc-lh": `${c.descLineHeight ?? 1.6}`,
  };

  const content = useMemo(() => {
    const fallback = {
      title: isBangla ? "কেন BABU88?" : "Why BABU88?",
      items: [
        {
          title: isBangla
            ? "সর্বোচ্চ এজেন্ট কমিশন"
            : "Highest Agent Commission",
          desc: isBangla
            ? "BABU88 এজেন্ট বাজারের সর্বোচ্চ কমিশন অফার করে! আমাদের সাথে সর্বদা বিজয়ী, যে কোনো প্রদানকারী যেখানেই থাকুন।"
            : "BABU88 offers the highest agent commission in the market! Stay ahead with us, wherever you are.",
        },
        {
          title: isBangla ? "বিশ্বস্ত ব্র্যান্ড" : "Trusted Brand",
          desc: isBangla
            ? "BABU88 হল একটি প্রিমিয়াম ক্রিকেট এক্সচেঞ্জ এবং ভারতের বৃহত্তম অনলাইন ক্যাসিনো প্ল্যাটফর্ম। ১০০ টিরও বেশি লাইভ ক্যাসিনো, স্লট এবং ছয়াল গেম রয়েছে।"
            : "BABU88 is a premium cricket exchange and one of the largest online casino platforms. Enjoy 100+ live casino, slots, and more games.",
        },
        {
          title: isBangla ? "দ্রুত উত্তোলন" : "Fast Withdrawals",
          desc: isBangla
            ? "আপনার সদস্যরা আমাদের দ্রুত এবং ১০০% নির্ভরযোগ্য উত্তোলনের মাধ্যমে সর্বদা খুশি থাকবেন।"
            : "Your members will be happy with our fast and 100% reliable withdrawals.",
        },
        {
          title: isBangla ? "স্বচ্ছতা" : "Transparency",
          desc: isBangla
            ? "এজেন্টদের দৈনিক জয় এবং কমিশন ট্র্যাক করার জন্য সম্পূর্ণ অ্যাক্সেসযোগ্য ব্যাকএন্ড সফটওয়্যার।"
            : "Fully accessible backend software to track agents’ daily wins and commissions.",
        },
      ],
    };

    if (!data?._id) {
      return {
        title: fallback.title,
        items: fallback.items.map((it, idx) => ({ ...it, Icon: ICONS[idx] })),
      };
    }

    const items = (data.items?.length ? data.items : fallback.items).slice(
      0,
      4,
    );

    return {
      title: isBangla
        ? data.sectionTitleBn || fallback.title
        : data.sectionTitleEn || fallback.title,
      items: items.map((it, idx) => ({
        title: isBangla
          ? it.titleBn || fallback.items[idx]?.title
          : it.titleEn || fallback.items[idx]?.title,
        desc: isBangla
          ? it.descBn || fallback.items[idx]?.desc
          : it.descEn || fallback.items[idx]?.desc,
        Icon: ICONS[idx] || DollarSign,
      })),
    };
  }, [isBangla, data]);

  const sk = {
    baseColor: "rgba(200,200,200,0.12)",
    highlightColor: "rgba(200,200,200,0.22)",
  };

  return (
    <section style={cssVars} className="w-full bg-[color:var(--w-bg)]">
      <div
        style={{ paddingTop: "var(--w-pady)", paddingBottom: "var(--w-pady)" }}
        className="max-w-7xl mx-auto px-4 sm:px-6"
      >
        {isLoading ? (
          <div className="space-y-10">
            <div className="flex justify-center">
              <Skeleton {...sk} width={280} height={36} borderRadius={8} />
            </div>

            <div
              className="border px-6 py-8"
              style={{
                background: "var(--w-card-bg)",
                borderColor: "var(--w-card-border)",
                borderRadius: "var(--w-card-radius)",
                boxShadow: "var(--w-card-shadow)",
                paddingLeft: "var(--w-card-padx)",
                paddingRight: "var(--w-card-padx)",
                paddingTop: "var(--w-card-pady)",
                paddingBottom: "var(--w-card-pady)",
              }}
            >
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                style={{ gap: "var(--w-gap)" }}
              >
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="text-center space-y-5">
                    <div
                      className="mx-auto flex items-center justify-center rounded-full"
                      style={{
                        width: 96,
                        height: 96,
                        background: "rgba(0,0,0,0.06)",
                      }}
                    >
                      <Skeleton {...sk} circle width={48} height={48} />
                    </div>
                    <Skeleton
                      {...sk}
                      height={22}
                      width="80%"
                      className="mx-auto"
                    />
                    <div className="space-y-2">
                      <Skeleton {...sk} height={14} count={3} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2
              className="text-center font-extrabold"
              style={{
                color: "var(--w-title)",
                fontSize: "var(--w-title-size)",
                marginBottom: "var(--w-title-mb)",
              }}
            >
              {content.title}
            </h2>

            <div
              className="border"
              style={{
                background: "var(--w-card-bg)",
                borderColor: "var(--w-card-border)",
                borderRadius: "var(--w-card-radius)",
                boxShadow: "var(--w-card-shadow)",
                paddingLeft: "var(--w-card-padx)",
                paddingRight: "var(--w-card-padx)",
                paddingTop: "var(--w-card-pady)",
                paddingBottom: "var(--w-card-pady)",
              }}
            >
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                style={{ gap: "var(--w-gap)" }}
              >
                {content.items.map((it, idx) => {
                  const Icon = it.Icon;
                  return (
                    <div key={idx} className="text-center">
                      <div
                        className="mx-auto mb-5 rounded-full flex items-center justify-center relative overflow-hidden"
                        style={{
                          width: "var(--w-ic-size)",
                          height: "var(--w-ic-size)",
                          background: "var(--w-ic-bg)",
                        }}
                      >
                        <span
                          className="absolute inset-0"
                          style={{
                            background: "var(--w-ic-overlay)",
                            transform: "translate(32px, 32px)",
                          }}
                        />
                        <Icon
                          className="relative"
                          size={Number(String(c.iconSize ?? 42))}
                          strokeWidth={2.5}
                          style={{ color: "var(--w-ic-color)" }}
                        />
                      </div>

                      <h3
                        className="font-extrabold"
                        style={{
                          color: "var(--w-it-title)",
                          fontSize: "var(--w-it-title-size)",
                          marginBottom: "var(--w-it-title-mb)",
                        }}
                      >
                        {it.title}
                      </h3>

                      <p
                        style={{
                          color: "var(--w-desc)",
                          fontSize: "var(--w-desc-size)",
                          lineHeight: "var(--w-desc-lh)",
                        }}
                      >
                        {it.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default WhyUs;
