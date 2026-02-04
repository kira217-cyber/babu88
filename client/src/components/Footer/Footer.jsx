import React, { useMemo } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";

const Footer = () => {
  // ✅ Replace these with your real image urls
  const data = useMemo(
    () => ({
      ambassadors: [
        {
          name: "Samira Mahi Khan",
          season: "2024/2025",
          img: "https://i.ibb.co/7kQ5m2m/jili.png", // 🔁 replace
        },
        {
          name: "Apu Biswas",
          season: "2023/2024",
          img: "https://i.ibb.co/YfQb0yD/pg.png", // 🔁 replace
        },
      ],
      sponsors: [
        {
          name: "Vegas Vikings",
          season: "2025/2026",
          img: "https://i.ibb.co/2Sg9P4w/inout.png",
        }, // 🔁 replace
        {
          name: "Sudurpaschim Royals",
          season: "2024/2025",
          img: "https://i.ibb.co/8D2K2bD/jdb.png",
        },
        {
          name: "Telugu Warriors",
          season: "2024/2025",
          img: "https://i.ibb.co/mB3z6tF/bng.png",
        },
        {
          name: "Colombo Strikers",
          season: "2024/2025",
          img: "https://i.ibb.co/3f8bPPv/habanero.png",
        },
        {
          name: "Grand Cayman Jaguars",
          season: "2024/2025",
          img: "https://i.ibb.co/4K3MZfM/smartsoft.png",
        },
        {
          name: "Montreal Tigers",
          season: "2023/2024",
          img: "https://i.ibb.co/5h1sZsQ/microgaming.png",
        },
        {
          name: "Dambulla Aurea",
          season: "2023/2024",
          img: "https://i.ibb.co/9yQ3PpH/onegame.png",
        },
        {
          name: "Northern Warriors",
          season: "2023/2024",
          img: "https://i.ibb.co/6bJt7m4/playtech.png",
        },
      ],
      payments: [
        { name: "bKash", img: "https://i.ibb.co/0GZK9XJ/netent.png" }, // 🔁 replace
        { name: "Nagad", img: "https://i.ibb.co/vc2qKc9/nolimit.png" },
        { name: "Rocket", img: "https://i.ibb.co/8Y7dB3f/relax.png" },
        { name: "Upay", img: "https://i.ibb.co/3mKcQ9t/pragmatic.png" },
      ],
      responsible: [
        { name: "18+", img: "https://i.ibb.co/1Zp3f9j/spade.png" }, // 🔁 replace
        { name: "GamCare", img: "https://i.ibb.co/1Mck7Wb/playngo.png" },
      ],
    }),
    [],
  );

  return (
    <footer className="w-full bg-[#3b3b3b] text-white">
      {/* container */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 py-10">
        {/* dotted divider */}
        <div className="border-t border-dotted border-white/25" />

        {/* Brand Ambassadors */}
        <section className="py-10">
          <h3 className="text-[#f5b400] font-extrabold text-lg mb-6">
            ব্র্যান্ড অ্যাম্বাসেডর
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.ambassadors.map((a) => (
              <div key={a.name} className="flex items-center gap-1">
                <div className="h-12 w-16 flex items-center justify-start">
                  <img
                    src={a.img}
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
            স্পনসরশিপ
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {data.sponsors.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.name}
                    className="h-9 w-9 object-contain opacity-95"
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

        {/* Payments + Responsible gaming (two columns like screenshot) */}
        <section className="py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Payments */}
            <div>
              <h3 className="text-[#f5b400] font-extrabold text-lg mb-6">
                মূল্যপরিশোধ পদ্ধতি
              </h3>

              <div className="flex flex-wrap items-center gap-6">
                {data.payments.map((p) => (
                  <div
                    key={p.name}
                    className="h-10 w-24 flex items-center justify-start opacity-80 hover:opacity-100 transition"
                    title={p.name}
                  >
                    <img
                      src={p.img}
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
                দায়বদ্ধ গেমিং
              </h3>

              <div className="flex items-center justify-start lg:justify-start gap-4">
                {data.responsible.map((r) => (
                  <div
                    key={r.name}
                    className="h-12 w-28 flex items-center justify-start opacity-70 hover:opacity-100 transition"
                    title={r.name}
                  >
                    <img
                      src={r.img}
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
                {/* Logo text same vibe */}
                <div className="select-none">
                  <p className="text-[34px] font-extrabold italic leading-none">
                    BABU<span className="text-[#f5b400]">88</span>
                  </p>
                  <p className="text-white/90 font-bold italic -mt-1">
                    Official
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[#f5b400] font-extrabold">
                Bangladesh&apos;s No.1 - The Biggest and Most Trusted
              </p>

              <p className="mt-2 text-white/80 font-semibold">
                কপিরাইট © 2026 | ব্র্যান্ড | সমস্ত অধিকার সংরক্ষিত
              </p>
            </div>

            {/* Right: Follow Us */}
            <div className="lg:text-center">
              <h3 className="text-[#f5b400] font-extrabold text-lg mb-6">
                আমাদের অনুসরণ করো
              </h3>

              <div className="flex items-center gap-4 justify-start lg:justify-center">
                <a
                  href="#"
                  className="h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="text-white text-xl" />
                </a>
                <a
                  href="#"
                  className="h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center"
                  aria-label="YouTube"
                >
                  <FaYoutube className="text-white text-xl" />
                </a>
                <a
                  href="#"
                  className="h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-white text-xl" />
                </a>
                <a
                  href="#"
                  className="h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center"
                  aria-label="X"
                >
                  <FaXTwitter className="text-white text-xl" />
                </a>
                <a
                  href="#"
                  className="h-12 w-12 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center"
                  aria-label="Telegram"
                >
                  <FaTelegramPlane className="text-white text-xl" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-dotted border-white/25" />

        {/* Long description text area (bottom black in screenshot) */}
        <section className="pt-8">
          <h3 className="text-[#f5b400] font-extrabold text-lg">
            বাংলাদেশের বিশ্বস্ত অনলাইন ক্যাসিনো এবং ক্রিকেট এক্সচেঞ্জ
          </h3>

          <p className="mt-4 text-white/75 leading-relaxed font-medium">
            Babu88 হল বাংলাদেশের প্রথম অনলাইন ক্যাসিনো, মোবাইল এবং ডেস্কটপ
            ব্যবহারকারীদের জন্য বিভিন্ন ধরনের গেম অফার করে। খেলোয়াড়রা অনলাইনে
            আসল টাকা জেতার সুযোগ সহ স্লট, পোকার, ব্যাকারাট, ব্ল্যাকজ্যাক এবং
            অন্যান্য ক্রিকেট এক্সচেঞ্জ গেম উপভোগ করতে পারে। আমাদের প্ল্যাটফর্ম
            সর্বোচ্চ নিরাপত্তা এবং দ্রুত লেনদেনের নিশ্চয়তা দেয়। আমরা 24/7
            সাপোর্ট প্রদান করি যাতে আপনার অভিজ্ঞতা সবসময় স্মুথ থাকে।
          </p>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
