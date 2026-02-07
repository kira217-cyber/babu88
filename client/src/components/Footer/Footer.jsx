import React, { useMemo } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { api } from "../../api/axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const fetchFooterData = async () => {
  const { data } = await api.get("/api/footer");
  return data;
};

const Footer = () => {
  const { isBangla } = useLanguage();

  // API থেকে ডেটা লোড
  const {
    data: footerData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["footer"],
    queryFn: fetchFooterData,
    staleTime: 5 * 60 * 1000, // 5 মিনিট ক্যাশে রাখবে
    retry: 1,
  });

  // Bilingual texts fallback (যদি API থেকে না আসে)
  const t = useMemo(
    () => ({
      brandAmbassadors: isBangla
        ? "ব্র্যান্ড অ্যাম্বাসেডর"
        : "Brand Ambassadors",
      sponsorship: isBangla ? "স্পনসরশিপ" : "Sponsorship",
      paymentMethods: isBangla ? "মূল্যপরিশোধ পদ্ধতি" : "Payment Methods",
      responsibleGaming: isBangla ? "দায়বদ্ধ গেমিং" : "Responsible Gaming",
      followUs: isBangla ? "আমাদের অনুসরণ করো" : "Follow Us",
      tagline: isBangla
        ? "বাংলাদেশের নং.১ - সবচেয়ে বড় এবং সবচেয়ে বিশ্বস্ত"
        : "Bangladesh's No.1 - The Biggest and Most Trusted",
      copyright: isBangla
        ? "কপিরাইট © 2026 | ব্র্যান্ড | সমস্ত অধিকার সংরক্ষিত"
        : "Copyright © 2026 | Brand | All Rights Reserved",
      trustedCasino: isBangla
        ? "বাংলাদেশের বিশ্বস্ত অনলাইন ক্যাসিনো এবং ক্রিকেট এক্সচেঞ্জ"
        : "Bangladesh's Trusted Online Casino and Cricket Exchange",
      description: isBangla
        ? footerData?.description_bn ||
          "Babu88 হল বাংলাদেশের প্রথম অনলাইন ক্যাসিনো..."
        : footerData?.description_en ||
          "Babu88 is Bangladesh's premier online casino...",
      official: isBangla ? "অফিসিয়াল" : "Official",
    }),
    [isBangla, footerData],
  );

  // API থেকে আসা ডেটা বা fallback
  const ambassadors = footerData?.ambassadors || [];
  const sponsors = footerData?.sponsors || [];
  const payments = footerData?.payments || [];
  const responsible = footerData?.responsible || [];
  const social = footerData?.social || {};
  const logo = footerData?.logo ? `${BASE_URL}${footerData.logo}` : "";

  if (isLoading) {
    return (
      <footer className="w-full bg-transparent text-white mb-8 md:mb-0">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 py-10">
          <div className="border-t border-dotted border-white/25 mb-10" />

          {/* Skeleton for Brand Ambassadors */}
          <div className="py-10">
            <Skeleton width={220} height={28} className="mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton circle width={64} height={64} />
                  <div>
                    <Skeleton width={140} height={20} className="mb-2" />
                    <Skeleton width={100} height={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* অন্যান্য সেকশনের জন্য skeleton */}
          <div className="py-10">
            <Skeleton width={180} height={28} className="mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} height={80} />
              ))}
            </div>
          </div>

          <div className="border-t border-dotted border-white/25 my-10" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <Skeleton width={180} height={28} className="mb-6" />
              <div className="flex flex-wrap gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} width={96} height={40} />
                ))}
              </div>
            </div>
            <div>
              <Skeleton width={220} height={28} className="mb-6" />
              <div className="flex gap-4">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} width={112} height={48} />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom skeleton */}
          <div className="py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <Skeleton width={192} height={48} className="mb-4" />
                <Skeleton width={300} height={24} className="mb-2" />
                <Skeleton width={220} height={20} />
              </div>
              <div className="lg:text-center">
                <Skeleton width={140} height={28} className="mb-6 mx-auto" />
                <div className="flex justify-center gap-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} circle width={48} height={48} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-dotted border-white/25 mt-10" />

          <div className="pt-8">
            <Skeleton width={280} height={28} className="mb-4" />
            <Skeleton count={5} height={20} className="mt-2" />
          </div>
        </div>
      </footer>
    );
  }

  if (isError) {
    return (
      <footer className="w-full bg-transparent text-white py-10 text-center">
        <p className="text-red-400">Failed to load footer content</p>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-[#3b3b3b] text-white mb-8 md:mb-0">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 py-10">
        <div className="border-t border-dotted border-white/25" />

        {/* Brand Ambassadors */}
        <section className="py-10">
          <h3 className="text-[#f5b400] font-extrabold text-lg mb-6">
            {footerData?.texts?.[isBangla ? "bn" : "en"]?.brandAmbassadors ||
              t.brandAmbassadors}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ambassadors.map((a) => (
              <div key={a._id || a.name} className="flex items-center gap-1">
                <div className="h-12 w-16 flex items-center justify-start">
                  <img
                    src={`${BASE_URL}${a.img}`}
                    alt={a.name}
                    className="max-h-12 w-auto object-contain opacity-90"
                    loading="lazy"
                  />
                </div>
                <div className="leading-tight">
                  <p className="font-extrabold text-white text-sm">{a.name}</p>
                  <p className="text-white/70 text-xs font-semibold">
                    {a.season}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-dotted border-white/25" />

        {/* Sponsorship */}
        <section className="py-10">
          <h3 className="text-[#f5b400] font-extrabold text-lg mb-6">
            {footerData?.texts?.[isBangla ? "bn" : "en"]?.sponsorship ||
              t.sponsorship}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {sponsors.map((s) => (
              <div key={s._id || s.name} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src={`${BASE_URL}${s.img}`}
                    alt={s.name}
                    className="h-10 w-10 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-sm text-white truncate">
                    {s.name}
                  </p>
                  <p className="text-white/70 text-xs font-semibold">
                    {s.season}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-dotted border-white/25" />

        {/* Payments + Responsible gaming */}
        <section className="py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Payments */}
            <div>
              <h3 className="text-[#f5b400] font-extrabold text-lg mb-6">
                {footerData?.texts?.[isBangla ? "bn" : "en"]?.paymentMethods ||
                  t.paymentMethods}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {payments.map((p) => (
                  <div
                    key={p._id || p.name}
                    className="h-10 w-24 flex items-center justify-start opacity-80 hover:opacity-100 transition"
                    title={p.name}
                  >
                    <img
                      src={`${BASE_URL}${p.img}`}
                      alt={p.name}
                      className="max-h-10 w-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Responsible */}
            <div className="lg:text-start">
              <h3 className="text-[#f5b400] font-extrabold text-lg mb-6">
                {footerData?.texts?.[isBangla ? "bn" : "en"]
                  ?.responsibleGaming || t.responsibleGaming}
              </h3>

              <div className="flex items-center justify-start lg:justify-start">
                {responsible.map((r) => (
                  <div
                    key={r._id || r.name}
                    className="h-12 w-28 flex items-center justify-start opacity-70 hover:opacity-100 transition"
                    title={r.name}
                  >
                    <img
                      src={`${BASE_URL}${r.img}`}
                      alt={r.name}
                      className="max-h-12 w-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-dotted border-white/25" />

        {/* Bottom row: Logo + text (left) and social icons (right) */}
        <section className="py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Logo + tagline */}
            <div>
              <div className="flex items-end gap-3">
                <div className="select-none">
                  <img
                    className="w-48 h-12"
                    src={
                      logo ||
                      "https://i.ibb.co.com/LhrtCJcH/babu88-official.png"
                    }
                    alt="Logo"
                    loading="lazy"
                  />
                </div>
              </div>

              <p className="mt-4 text-[#f5b400] font-extrabold">
                {footerData?.texts?.[isBangla ? "bn" : "en"]?.tagline ||
                  t.tagline}
              </p>

              <p className="mt-2 text-white/80 font-semibold">
                {footerData?.texts?.[isBangla ? "bn" : "en"]?.copyright ||
                  t.copyright}
              </p>
            </div>

            {/* Right: Follow Us */}
            <div className="lg:text-center">
              <h3 className="text-[#f5b400] font-extrabold text-lg mb-6">
                {footerData?.texts?.[isBangla ? "bn" : "en"]?.followUs ||
                  t.followUs}
              </h3>

              <div className="flex items-center gap-4 justify-start lg:justify-center">
                <a
                  href={social.facebook || "#"}
                  className="h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center cursor-pointer"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebookF className="text-white text-xl" />
                </a>
                <a
                  href={social.youtube || "#"}
                  className="h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center cursor-pointer"
                  aria-label="YouTube"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaYoutube className="text-white text-xl" />
                </a>
                <a
                  href={social.instagram || "#"}
                  className="h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center cursor-pointer"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram className="text-white text-xl" />
                </a>
                <a
                  href={social.twitter || "#"}
                  className="h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center cursor-pointer"
                  aria-label="X"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaXTwitter className="text-white text-xl" />
                </a>
                <a
                  href={social.telegram || "#"}
                  className="h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center cursor-pointer"
                  aria-label="Telegram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTelegramPlane className="text-white text-xl" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-dotted border-white/25" />

        {/* Long description */}
        <section className="pt-8">
          <h3 className="text-[#f5b400] font-extrabold text-lg">
            {footerData?.texts?.[isBangla ? "bn" : "en"]?.trustedCasino ||
              t.trustedCasino}
          </h3>

          <p className="mt-4 text-white/75 leading-relaxed font-medium">
            {footerData?.texts?.[isBangla ? "bn" : "en"]?.description ||
              t.description}
          </p>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
