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
    queryFn: async () => {
      const res = await api.get("/api/aff-notice");
      return res.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

  const noticeText = useMemo(() => {
    const fallbackBn =
      "আজই ৬০% পর্যন্ত কমিশন পান! আজই BABU88 এজেন্ট হন! আজই ৬০% পর্যন্ত কমিশন পান! আজই BABU88 এজেন্ট হন!";
    const fallbackEn =
      "Get up to 60% commission today! Become a BABU88 agent today! Get up to 60% commission today! Become a BABU88 agent today!";

    if (isLoading || !data?._id) return isBangla ? fallbackBn : fallbackEn;

    return isBangla ? data.textBn || fallbackBn : data.textEn || fallbackEn;
  }, [isBangla, data, isLoading]);

  const speedSec = Number(data?.speedSec) || 16;

  return (
    <div className="w-full bg-[#2b2b2b]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {isLoading ? (
          // Loading skeleton - yellow pill style
          <div className="bg-[#f5b400] rounded-md sm:rounded-md px-3 sm:px-6 py-2 sm:py-3 overflow-hidden">
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
          // Real notice content
          <div className="bg-[#f5b400] rounded-md sm:rounded-md px-3 sm:px-6 py-2 sm:py-3 overflow-hidden">
            <div className="notice-viewport">
              <div className="notice-single text-black font-bold text-sm sm:text-base md:text-lg whitespace-nowrap">
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
          animation: noticeOne ${speedSec}s linear infinite;
        }
        @keyframes noticeOne {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
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
