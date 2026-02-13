import React, { useMemo } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaTelegramPlane,
} from "react-icons/fa";
import { api } from "../../api/axios";

const Footer = () => {
  const { isBangla } = useLanguage();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["aff-footer"],
    queryFn: async () => {
      const res = await api.get("/api/aff-footer");
      return res.data;
    },
    staleTime: 60_000,
  });

  // Fallback text when no data or loading/error
  const t = useMemo(() => {
    // Default fallback (used during loading or when no data)
    const fallback = {
      leftTitle: isBangla
        ? "BABU88 এশিয়ার বিশ্বস্ত অনলাইন ক্যাসিনো। বাংলাদেশ, ভারত, নেপাল পাওয়া যাচ্ছে।"
        : "BABU88 is Asia’s trusted online casino. Available in Bangladesh, India, and Nepal.",
      leftBody: isBangla
        ? "BABU88 হল একটি অনলাইন জুয়া কোম্পানি, যা বিশ্বস্তভাবে বাজি এবং ক্যাসিনো অফার করে। ২০২১ সাল থেকে BABU88 দক্ষিণ এশিয়ার সবচেয়ে জনপ্রিয় একটি প্ল্যাটফর্ম হিসেবে পরিচিত। আমাদের লক্ষ্য হল নিরাপদ এবং দ্রুত সার্ভিস প্রদান করা।"
        : "BABU88 is an online betting and casino platform known for reliable service. Since 2021, BABU88 has become one of the most popular platforms in South Asia. Our goal is to provide safe and fast service.",
      rightTitle: isBangla
        ? "অফিসিয়াল পার্টনার এবং স্পনসর"
        : "Official Partners & Sponsors",
      responsibleTitle: isBangla ? "দায়িত্বশীল গেমিং" : "Responsible Gaming",
      paymentTitle: isBangla ? "পেমেন্ট পদ্ধতি" : "Payment Methods",
      followTitle: isBangla ? "আমাদের অনুসরণ করুন" : "Follow Us",
      copyright: isBangla
        ? "Copyright © 2025 BABU88. All rights reserved"
        : "Copyright © 2025 BABU88. All rights reserved",
      officialLogoUrl: "",
      partners: [],
      paymentMethods: [],
      responsible: [],
      socialLinks: {},
    };

    if (isLoading || isError || !data?._id) {
      return fallback;
    }

    return {
      leftTitle: isBangla
        ? data.leftTitleBn || fallback.leftTitle
        : data.leftTitleEn || fallback.leftTitle,
      leftBody: isBangla
        ? data.leftBodyBn || fallback.leftBody
        : data.leftBodyEn || fallback.leftBody,
      rightTitle: isBangla
        ? data.rightTitleBn || fallback.rightTitle
        : data.rightTitleEn || fallback.rightTitle,
      responsibleTitle: isBangla
        ? data.responsibleTitleBn || fallback.responsibleTitle
        : data.responsibleTitleEn || fallback.responsibleTitle,
      paymentTitle: isBangla
        ? data.paymentTitleBn || fallback.paymentTitle
        : data.paymentTitleEn || fallback.paymentTitle,
      followTitle: isBangla
        ? data.followTitleBn || fallback.followTitle
        : data.followTitleEn || fallback.followTitle,
      copyright: isBangla
        ? data.copyrightBn || fallback.copyright
        : data.copyrightEn || fallback.copyright,
      officialLogoUrl: data.officialLogoUrl || "",
      partners: data.partners || [],
      paymentMethods: data.paymentMethods || [],
      responsible: data.responsible || [],
      socialLinks: data.socialLinks || {},
    };
  }, [isBangla, data, isLoading, isError]);

  const SocialIcon = ({ href, label, children }) => {
    const link = href?.trim() || "#";
    return (
      <a
        href={link}
        target={link !== "#" ? "_blank" : undefined}
        rel={link !== "#" ? "noreferrer" : undefined}
        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition"
        aria-label={label}
      >
        {children}
      </a>
    );
  };

  // ────────────────────────────────────────────────────────────────
  // Loading / Skeleton UI
  // ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <footer className="w-full bg-black text-white mb-12 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="border-t border-dashed border-white/30 mb-10" />

          <div className="grid grid-cols-1 lg:flex lg:justify-between gap-10">
            {/* Left Column Skeleton */}
            <div className="space-y-6">
              <Skeleton width={280} height={28} />
              <Skeleton count={4} className="text-sm leading-relaxed" />
              <div className="mt-10">
                <Skeleton width={240} height={64} />
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-8">
              <Skeleton width={220} height={28} />
              <div className="flex flex-wrap gap-6">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton circle width={80} height={80} />
                      <Skeleton width={70} height={14} className="mt-2" />
                    </div>
                  ))}
              </div>

              <Skeleton width={200} height={28} className="mt-10" />
              <div className="flex gap-6">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} width={100} height={40} />
                  ))}
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-white/30 my-10" />

          <div className="grid grid-cols-1 lg:flex lg:justify-between gap-10">
            <div className="space-y-6">
              <Skeleton width={180} height={28} />
              <div className="flex flex-wrap gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} width={90} height={32} />
                  ))}
              </div>
              <Skeleton width={220} height={16} className="mt-10" />
            </div>

            <div className="lg:text-center space-y-6">
              <Skeleton width={140} height={28} />
              <div className="flex lg:justify-center gap-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} circle width={40} height={40} />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // Normal Render (when data is loaded)
  // ────────────────────────────────────────────────────────────────
  return (
    <footer className="w-full bg-black text-white mb-12 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* top dotted line */}
        <div className="border-t border-dashed border-white/30 mb-10" />

        {/* TOP GRID */}
        <div className="grid grid-cols-1 lg:flex lg:justify-between gap-10">
          {/* LEFT SIDE */}
          <div>
            <h3 className="text-base sm:text-lg font-bold leading-snug">
              {t.leftTitle}
            </h3>

            <p className="mt-4 text-sm sm:text-[15px] text-white/80 leading-relaxed max-w-2xl">
              {t.leftBody}
            </p>

            <div className="mt-10">
              {t.officialLogoUrl ? (
                <img
                  className="w-60 h-16 object-contain"
                  src={t.officialLogoUrl}
                  alt="BABU88 OFFICIAL"
                  loading="lazy"
                />
              ) : (
                <div className="w-60 h-16 rounded bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/60">
                  No Logo
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div>
            <h3 className="text-base sm:text-lg font-bold">{t.rightTitle}</h3>

            <div className="mt-5 flex flex-wrap items-center gap-6">
              {(t.partners || []).map((p, idx) => (
                <div key={p.name + idx} className="text-center">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-10 sm:h-12 w-auto mx-auto opacity-80 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300"
                    loading="lazy"
                  />
                  <p className="mt-2 text-[10px] sm:text-xs text-white/70">
                    {p.name}
                  </p>
                </div>
              ))}
            </div>

            <h3 className="mt-10 text-base sm:text-lg font-bold">
              {t.responsibleTitle}
            </h3>

            <div className="mt-4 flex items-center gap-6 flex-wrap">
              {(t.responsible || []).map((r, idx) => (
                <img
                  key={r.name + idx}
                  src={r.imageUrl}
                  alt={r.name}
                  className="h-8 sm:h-10 w-auto opacity-70 hover:opacity-100 transition"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-white/30 my-10" />

        {/* BOTTOM GRID */}
        <div className="grid grid-cols-1 lg:flex lg:justify-between gap-10 items-start">
          {/* payment */}
          <div>
            <h4 className="text-base sm:text-lg font-bold">{t.paymentTitle}</h4>

            <div className="mt-5 flex flex-wrap items-center gap-6">
              {(t.paymentMethods || []).map((m, idx) => (
                <img
                  key={m.name + idx}
                  src={m.imageUrl}
                  alt={m.name}
                  className="h-6 sm:h-7 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300"
                  loading="lazy"
                />
              ))}
            </div>

            <p className="mt-10 text-sm text-white/80">{t.copyright}</p>
          </div>

          {/* social */}
          <div className="lg:text-center">
            <h4 className="text-base sm:text-lg font-bold">{t.followTitle}</h4>

            <div className="mt-5 flex lg:justify-center items-center gap-4 flex-wrap">
              <SocialIcon href={t.socialLinks?.facebook} label="Facebook">
                <FaFacebookF />
              </SocialIcon>
              <SocialIcon href={t.socialLinks?.twitter} label="Twitter">
                <FaTwitter />
              </SocialIcon>
              <SocialIcon href={t.socialLinks?.youtube} label="YouTube">
                <FaYoutube />
              </SocialIcon>
              <SocialIcon href={t.socialLinks?.instagram} label="Instagram">
                <FaInstagram />
              </SocialIcon>
              <SocialIcon href={t.socialLinks?.telegram} label="Telegram">
                <FaTelegramPlane />
              </SocialIcon>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
