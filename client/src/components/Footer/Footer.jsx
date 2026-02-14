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

const fetchFooterColor = async () => {
  const { data } = await api.get("/api/footer-color");
  return data;
};

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== "string") return `rgba(255,255,255,${alpha})`;
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `rgba(255,255,255,${alpha})`;
};

const Footer = () => {
  const { isBangla } = useLanguage();

  const {
    data: footerData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["footer"],
    queryFn: fetchFooterData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: footerColor } = useQuery({
    queryKey: ["footer-color"],
    queryFn: fetchFooterColor,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const c = useMemo(() => {
    return {
      footerBg: footerColor?.footerBg || "#3b3b3b",
      accent: footerColor?.accent || "#f5b400",

      borderColor: footerColor?.borderColor || "#ffffff",
      borderOpacity: footerColor?.borderOpacity ?? 0.25,

      textMain: footerColor?.textMain || "#ffffff",

      textMuted: footerColor?.textMuted || "#ffffff",
      textMutedOpacity: footerColor?.textMutedOpacity ?? 0.8,

      textSoft: footerColor?.textSoft || "#ffffff",
      textSoftOpacity: footerColor?.textSoftOpacity ?? 0.75,

      socialBg: footerColor?.socialBg || "#ffffff",
      socialBgOpacity: footerColor?.socialBgOpacity ?? 0.15,
      socialHoverOpacity: footerColor?.socialHoverOpacity ?? 0.25,
      socialIcon: footerColor?.socialIcon || "#ffffff",
      socialIconSize: footerColor?.socialIconSize ?? 20,

      sectionTitleSize: footerColor?.sectionTitleSize ?? 18,
      taglineSize: footerColor?.taglineSize ?? 16,
      copyrightSize: footerColor?.copyrightSize ?? 14,
      bodySize: footerColor?.bodySize ?? 16,
      smallSize: footerColor?.smallSize ?? 12,
    };
  }, [footerColor]);

  const footerVars = useMemo(() => {
    return {
      "--footer-bg": c.footerBg,
      "--footer-accent": c.accent,

      "--footer-border": hexToRgba(c.borderColor, c.borderOpacity),

      "--footer-text": c.textMain,
      "--footer-muted": hexToRgba(c.textMuted, c.textMutedOpacity),
      "--footer-soft": hexToRgba(c.textSoft, c.textSoftOpacity),

      "--footer-social-bg": hexToRgba(c.socialBg, c.socialBgOpacity),
      "--footer-social-bg-hover": hexToRgba(c.socialBg, c.socialHoverOpacity),
      "--footer-social-icon": c.socialIcon,
      "--footer-social-icon-size": `${c.socialIconSize}px`,
    };
  }, [c]);

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
          {/* skeleton unchanged */}
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
    <footer className="w-full text-white mb-8 md:mb-0" style={footerVars}>
      <div className="w-full" style={{ backgroundColor: "var(--footer-bg)" }}>
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 py-10">
          <div
            className="border-t border-dotted"
            style={{ borderColor: "var(--footer-border)" }}
          />

          {/* Brand Ambassadors */}
          <section className="py-10">
            <h3
              className="font-extrabold mb-6"
              style={{
                color: "var(--footer-accent)",
                fontSize: `${c.sectionTitleSize}px`,
              }}
            >
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
                    <p
                      className="font-extrabold"
                      style={{
                        color: "var(--footer-text)",
                        fontSize: `${c.smallSize + 2}px`,
                      }}
                    >
                      {a.name}
                    </p>
                    <p
                      className="font-semibold"
                      style={{
                        color: "var(--footer-muted)",
                        fontSize: `${c.smallSize}px`,
                      }}
                    >
                      {a.season}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div
            className="border-t border-dotted"
            style={{ borderColor: "var(--footer-border)" }}
          />

          {/* Sponsorship */}
          <section className="py-10">
            <h3
              className="font-extrabold mb-6"
              style={{
                color: "var(--footer-accent)",
                fontSize: `${c.sectionTitleSize}px`,
              }}
            >
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
                    <p
                      className="font-extrabold truncate"
                      style={{
                        color: "var(--footer-text)",
                        fontSize: `${c.smallSize + 2}px`,
                      }}
                    >
                      {s.name}
                    </p>
                    <p
                      className="font-semibold"
                      style={{
                        color: "var(--footer-muted)",
                        fontSize: `${c.smallSize}px`,
                      }}
                    >
                      {s.season}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div
            className="border-t border-dotted"
            style={{ borderColor: "var(--footer-border)" }}
          />

          {/* Payments + Responsible gaming */}
          <section className="py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Payments */}
              <div>
                <h3
                  className="font-extrabold mb-6"
                  style={{
                    color: "var(--footer-accent)",
                    fontSize: `${c.sectionTitleSize}px`,
                  }}
                >
                  {footerData?.texts?.[isBangla ? "bn" : "en"]
                    ?.paymentMethods || t.paymentMethods}
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
                <h3
                  className="font-extrabold mb-6"
                  style={{
                    color: "var(--footer-accent)",
                    fontSize: `${c.sectionTitleSize}px`,
                  }}
                >
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

          <div
            className="border-t border-dotted"
            style={{ borderColor: "var(--footer-border)" }}
          />

          {/* Bottom row */}
          <section className="py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Left */}
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

                <p
                  className="mt-4 font-extrabold"
                  style={{
                    color: "var(--footer-accent)",
                    fontSize: `${c.taglineSize}px`,
                  }}
                >
                  {footerData?.texts?.[isBangla ? "bn" : "en"]?.tagline ||
                    t.tagline}
                </p>

                <p
                  className="mt-2 font-semibold"
                  style={{
                    color: "var(--footer-muted)",
                    fontSize: `${c.copyrightSize}px`,
                  }}
                >
                  {footerData?.texts?.[isBangla ? "bn" : "en"]?.copyright ||
                    t.copyright}
                </p>
              </div>

              {/* Right */}
              <div className="lg:text-center">
                <h3
                  className="font-extrabold mb-6"
                  style={{
                    color: "var(--footer-accent)",
                    fontSize: `${c.sectionTitleSize}px`,
                  }}
                >
                  {footerData?.texts?.[isBangla ? "bn" : "en"]?.followUs ||
                    t.followUs}
                </h3>

                <div className="flex items-center gap-4 justify-start lg:justify-center">
                  {[
                    {
                      href: social.facebook || "#",
                      label: "Facebook",
                      Icon: FaFacebookF,
                    },
                    {
                      href: social.youtube || "#",
                      label: "YouTube",
                      Icon: FaYoutube,
                    },
                    {
                      href: social.instagram || "#",
                      label: "Instagram",
                      Icon: FaInstagram,
                    },
                    {
                      href: social.twitter || "#",
                      label: "X",
                      Icon: FaXTwitter,
                    },
                    {
                      href: social.telegram || "#",
                      label: "Telegram",
                      Icon: FaTelegramPlane,
                    },
                  ].map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      className="h-12 w-12 rounded-full transition flex items-center justify-center cursor-pointer bg-[var(--footer-social-bg)] hover:bg-[var(--footer-social-bg-hover)]"
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon
                        className="text-[length:var(--footer-social-icon-size)]"
                        style={{ color: "var(--footer-social-icon)" }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div
            className="border-t border-dotted"
            style={{ borderColor: "var(--footer-border)" }}
          />

          {/* Long description */}
          <section className="pt-8">
            <h3
              className="font-extrabold"
              style={{
                color: "var(--footer-accent)",
                fontSize: `${c.sectionTitleSize}px`,
              }}
            >
              {footerData?.texts?.[isBangla ? "bn" : "en"]?.trustedCasino ||
                t.trustedCasino}
            </h3>

            <p
              className="mt-4 leading-relaxed font-medium"
              style={{
                color: "var(--footer-soft)",
                fontSize: `${c.bodySize}px`,
              }}
            >
              {footerData?.texts?.[isBangla ? "bn" : "en"]?.description ||
                t.description}
            </p>
          </section>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
