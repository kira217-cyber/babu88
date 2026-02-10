import React, { useMemo } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";


const fetchNotice = async () => {
  const { data } = await api.get("/api/notice");
  return data;
};

const Notice = () => {
  const { isBangla } = useLanguage();

  const { data: noticeData } = useQuery({
    queryKey: ["notice"],
    queryFn: fetchNotice,
    staleTime: 1000 * 60 * 5,
  });

  // ✅ fallback (যদি কোনো কারণে API fail করে)
  const fallbackBn =
    "পেমেন্ট কদই, বা OTP কারো সাথে শেয়ার করবেন না। এছাড়াও, তুমি প্যাকের রেটিং লিংকে ক্লিক করবেন না। সহায়তার জন্য, নিচে উল্লেখিত লাইভ চ্যাটের মাধ্যমে আমাদের সাথে যোগাযোগ করুন।";
  const fallbackEn =
    "Never share your payment code or OTP with anyone. Also, do not click on any suspicious rating or recharge links. For support, contact us via the live chat below.";

  const noticeText = useMemo(() => {
    const isActive = noticeData?.isActive ?? true;
    if (!isActive) return ""; // inactive হলে কিছু দেখাবে না

    if (isBangla) return noticeData?.noticeBn || fallbackBn;
    return noticeData?.noticeEn || fallbackEn;
  }, [isBangla, noticeData]);

  // inactive হলে component hide
  if (!noticeText) return null;

  return (
    <section className="w-full mt-4 px-2 lg:px-0">
      <div className="w-full mx-auto max-w-[1500px] bg-[#3c3c3c] rounded-md overflow-hidden border border-black/20">
        <div className="flex items-center">
          <div className="relative flex-1 overflow-hidden py-2 sm:py-2.5">
            <div className="marquee-track">
              <div className="marquee-content">
                <span className="marquee-text">{noticeText}</span>
                <span className="marquee-sep">•</span>
                <span className="marquee-text">{noticeText}</span>
                <span className="marquee-sep">•</span>
                <span className="marquee-text">{noticeText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .marquee-track{
          width: 100%;
          overflow: hidden;
        }
        .marquee-content{
          display: inline-flex;
          align-items: center;
          gap: 18px;
          white-space: nowrap;
          will-change: transform;
          animation: marqueeMove 30s linear infinite;
        }
        .marquee-text{
          color: rgba(255,255,255,0.92);
          font-weight: 800;
          font-size: 14px;
        }
        @media (min-width: 640px){
          .marquee-text{ font-size: 14px; }
          .marquee-content{ gap: 22px; }
        }
        @media (min-width: 1024px){
          .marquee-text{ font-size: 14px; }
        }
        .marquee-sep{
          color: rgba(255,255,255,0.35);
          font-weight: 900;
        }

        @keyframes marqueeMove{
          0% { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-50%,0,0); }
        }

        @media (prefers-reduced-motion: reduce){
          .marquee-content{ animation: none; }
        }
      `}</style>
    </section>
  );
};

export default Notice;
