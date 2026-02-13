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
    queryFn: async () => {
      const res = await api.get("/api/aff-whyus");
      return res.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

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

    if (!data?._id) return fallback;

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
    <section className="w-full bg-[#2b2b2b] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {isLoading ? (
          // Single loading skeleton wrapper for the whole section
          <div className="space-y-10">
            {/* Title skeleton */}
            <div className="flex justify-center">
              <Skeleton {...sk} width={280} height={36} borderRadius={8} />
            </div>

            {/* Card + content skeleton */}
            <div className="bg-white rounded-md border border-black/10 shadow-[0_10px_25px_rgba(0,0,0,0.25)] px-6 sm:px-10 py-8 sm:py-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="text-center space-y-5">
                    {/* Icon circle skeleton */}
                    <div className="mx-auto w-24 h-24 rounded-full bg-gray-200/30 flex items-center justify-center">
                      <Skeleton {...sk} circle width={48} height={48} />
                    </div>

                    {/* Title skeleton */}
                    <Skeleton
                      {...sk}
                      height={22}
                      width="80%"
                      className="mx-auto"
                    />

                    {/* Description skeleton */}
                    <div className="space-y-2">
                      <Skeleton {...sk} height={14} count={3} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Real content
          <>
            {/* Title */}
            <h2 className="text-center text-white text-2xl sm:text-3xl font-extrabold mb-8 sm:mb-10">
              {content.title}
            </h2>

            {/* White Card */}
            <div className="bg-white rounded-md border border-black/10 shadow-[0_10px_25px_rgba(0,0,0,0.25)] px-6 sm:px-10 py-8 sm:py-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                {content.items.map((it, idx) => {
                  const Icon = it.Icon;

                  return (
                    <div key={idx} className="text-center">
                      {/* Icon circle */}
                      <div className="mx-auto mb-5 w-24 h-24 rounded-full bg-[#f5b400] flex items-center justify-center relative overflow-hidden">
                        <span className="absolute inset-0 translate-x-8 translate-y-8 bg-black/10" />
                        <Icon
                          className="relative text-white"
                          size={42}
                          strokeWidth={2.5}
                        />
                      </div>

                      <h3 className="text-lg font-extrabold text-black mb-3">
                        {it.title}
                      </h3>

                      <p className="text-sm text-black/80 leading-relaxed">
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
