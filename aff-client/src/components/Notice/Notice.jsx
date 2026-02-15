import React, { useMemo } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Notice = () => {
  const { isBangla } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["aff-notice"],
    queryFn: async () => (await api.get("/api/aff-notice")).data,
    staleTime: 60_000,
    retry: 1,
  });

  // ✅ UI config
  const { data: cfg } = useQuery({
    queryKey: ["aff-notice-color"],
    queryFn: async () => (await api.get("/api/aff-notice-color")).data,
    staleTime: 60_000,
    retry: 1,
  });

  const c = cfg || {};
  const cssVars = {
    "--n-outer": c.outerBg || "#2b2b2b",
    "--n-pill": c.pillBg || "#f5b400",
    "--n-text": c.pillText || "#000000",

    "--n-radius": `${c.radius ?? 6}px`,
    "--n-padx": `${c.padX ?? 24}px`,
    "--n-pady": `${c.padY ?? 12}px`,

    "--n-fs-m": `${c.textSizeMobile ?? 14}px`,
    "--n-fs-sm": `${c.textSizeSm ?? 16}px`,
    "--n-fs-md": `${c.textSizeMd ?? 18}px`,
    "--n-fw": `${c.fontWeight ?? 700}`,

    "--n-speed": `${Number(data?.speedSec) || Number(c.speedSecDefault) || 16}s`,
  };

  const noticeText = useMemo(() => {
    const fallbackBn =
      "আজই ৬০% পর্যন্ত কমিশন পান! আজই BABU88 এজেন্ট হন! আজই ৬০% পর্যন্ত কমিশন পান! আজই BABU88 এজেন্ট হন!";
    const fallbackEn =
      "Get up to 60% commission today! Become a BABU88 agent today! Get up to 60% commission today! Become a BABU88 agent today!";

    if (isLoading || !data?._id) return isBangla ? fallbackBn : fallbackEn;

    return isBangla ? data.textBn || fallbackBn : data.textEn || fallbackEn;
  }, [isBangla, data, isLoading]);

  return (
    <div style={cssVars} className="w-full bg-[color:var(--n-outer)] pt-2 md:pt-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {isLoading ? (
          <div
            className="overflow-hidden"
            style={{
              background: "var(--n-pill)",
              borderRadius: "var(--n-radius)",
              paddingLeft: "var(--n-padx)",
              paddingRight: "var(--n-padx)",
              paddingTop: "var(--n-pady)",
              paddingBottom: "var(--n-pady)",
            }}
          >
            <div className="notice-viewport">
              <Skeleton
                height={24}
                width="90%"
                baseColor="#e0b800"
                highlightColor="#f5d042"
                borderRadius={4}
                className="opacity-80"
              />
            </div>
          </div>
        ) : (
          <div
            className="overflow-hidden"
            style={{
              background: "var(--n-pill)",
              borderRadius: "var(--n-radius)",
              paddingLeft: "var(--n-padx)",
              paddingRight: "var(--n-padx)",
              paddingTop: "var(--n-pady)",
              paddingBottom: "var(--n-pady)",
            }}
          >
            <div className="notice-viewport">
              <div
                className="notice-single whitespace-nowrap"
                style={{
                  color: "var(--n-text)",
                  fontWeight: "var(--n-fw)",
                  fontSize: "var(--n-fs-m)",
                }}
              >
                {noticeText}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .notice-viewport {
          position: relative;
          overflow: hidden;
          width: 100%;
        }
        .notice-single {
          display: inline-block;
          will-change: transform;
          animation: noticeOne var(--n-speed) linear infinite;
        }
        @keyframes noticeOne {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        @media (min-width: 640px) {
          .notice-single { font-size: var(--n-fs-sm); }
        }
        @media (min-width: 768px) {
          .notice-single { font-size: var(--n-fs-md); }
        }

        @media (prefers-reduced-motion: reduce) {
          .notice-single {
            animation: none;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Notice;
