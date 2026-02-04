import React from "react";
import { useNavigate } from "react-router";

const TwoBanner = () => {
  const navigate = useNavigate();

  // 🔁 replace with your real banner images
  const LEFT_BANNER = "https://i.ibb.co/3f8bPPv/habanero.png"; // replace
  const RIGHT_BANNER = "https://i.ibb.co/4K3MZfM/smartsoft.png"; // replace

  return (
    <section className="w-full mt-4">
      <div className="mx-auto max-w-[1500px] px-2 lg:px-0 py-4">
        {/* grid: left bigger, right smaller */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT (bigger) */}
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-2xl bg-[#2f2f2f] shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
              {/* Background image */}
              <div className="h-[160px] sm:h-[190px] md:h-[210px] lg:h-[280px]">
                <img
                  src={LEFT_BANNER}
                  alt="Refer friends"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>

              {/* Dark overlay (like screenshot) */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72),rgba(0,0,0,0.35),rgba(0,0,0,0.08))]" />

              {/* Content */}
              <div className="absolute inset-0 p-4 sm:p-6 flex">
                <div className="max-w-[75%] sm:max-w-[65%]">
                  <h3 className="text-white font-extrabold text-[16px] sm:text-[18px] lg:text-[24px]">
                    Refer friends and start earning
                  </h3>

                  <p
                    className="
    mt-2 text-white/85
    text-[12px] sm:text-[13px] lg:text-[18px]
    leading-relaxed
    line-clamp-2
    sm:line-clamp-none
  "
                  >
                    বাংলাদেশের নং ১ ফ্রেন্ড রেফারেল প্রোগ্রাম এখন এখানে! একজন
                    বন্ধুকে রেফার করে ফ্রি ৳৫০০ উপভোগ করুন এবং আপনার বন্ধু
                    প্রতিবার জমা দিলে আনলিমিটেড সর্বোচ্চ % কমিশন পান!
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/refer")}
                    className="
                      mt-4 inline-flex cursor-pointer items-center justify-center
                      h-10 px-5 rounded-full
                      bg-[#f5b400] text-black font-extrabold text-sm
                      shadow-[0_10px_18px_rgba(245,180,0,0.35)]
                      hover:brightness-95 active:scale-[0.99]
                      transition
                    "
                  >
                    Refer Now
                  </button>
                </div>
              </div>

              {/* Soft glow on right like screenshot */}
              <div className="pointer-events-none absolute right-0 top-0 h-full w-[45%] bg-[radial-gradient(circle_at_70%_40%,rgba(245,180,0,0.25),transparent_55%)]" />
            </div>
          </div>

          {/* RIGHT (smaller) */}
          <div className="lg:col-span-4">
            <div className="relative overflow-hidden rounded-2xl bg-[#2f2f2f] shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
              <div className="h-[160px] sm:h-[190px] md:h-[210px] lg:h-[280px]">
                <img
                  src={RIGHT_BANNER}
                  alt="Exclusive betting pass"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>

              {/* subtle overlay for readability / same vibe */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.18),rgba(0,0,0,0.05),rgba(0,0,0,0.18))]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwoBanner;
