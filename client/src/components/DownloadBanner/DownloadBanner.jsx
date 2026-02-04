import React, { useMemo } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import { FaAndroid, FaDownload } from "react-icons/fa";

const DownloadBanner = () => {
  const { isBangla } = useLanguage();

  // 🔁 তোমার APK direct download link এখানে বসাও
  const APK_URL = "https://example.com/your-app.apk"; // ✅ replace

  // 🔁 Right side image (mockup) এখানে বসাও
  const RIGHT_IMAGE = "https://i.ibb.co/6bJt7m4/playtech.png"; // ✅ replace (your screenshot image)

  const t = useMemo(
    () => ({
      title: isBangla
        ? "অফিসিয়াল BABU88 মোবাইল অ্যাপ চালু হতে যাচ্ছে।\nযেতে যেতে নির্দিষ্ট গেম উপভোগ করুন!"
        : "Official BABU88 mobile app is coming soon.\nEnjoy your favorite games on the go!",
      sub: isBangla
        ? "ডাউনলোড করুন এবং ইউজারের মধ্যে দূর দিন!"
        : "Download now and get started in seconds!",
      btnDownload: isBangla ? "এখনই ডাউনলোড করুন" : "Download Now",
      btnAndroid: isBangla ? "Android এ উপলব্ধ" : "Available on Android",
    }),
    [isBangla],
  );

  // ✅ force download
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = APK_URL;
    link.setAttribute("download", "BABU88.apk"); // filename hint
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-[1500px] px-2 lg:px-0 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* LEFT */}
          <div>
            <h2 className="text-[22px] sm:text-[28px] lg:text-[34px] font-extrabold text-black leading-snug whitespace-pre-line">
              {t.title}
            </h2>

            <p className="mt-3 text-black/60 font-semibold text-[14px] sm:text-[16px]">
              {t.sub}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownload}
                className="
                  inline-flex cursor-pointer items-center justify-center gap-2
                  h-12 px-5 rounded-xl
                  bg-[#f5b400] text-black font-extrabold
                  shadow-[0_8px_18px_rgba(245,180,0,0.35)]
                  hover:brightness-95 active:scale-[0.99]
                  transition
                "
              >
                <FaDownload />
                {t.btnDownload}
              </button>

              {/* Android badge style button */}
              <a
                href={APK_URL}
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload();
                }}
                className="
                  inline-flex cursor-pointer items-center justify-center gap-2
                  h-12 px-5 rounded-xl
                  bg-white text-[#6ac259]
                  border border-black/10
                  shadow-[0_10px_25px_rgba(0,0,0,0.08)]
                  hover:bg-black/5 active:scale-[0.99]
                  transition
                "
              >
                <FaAndroid className="text-[20px]" />
                <span className="font-extrabold">{t.btnAndroid}</span>
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* white glow like screenshot */}
              <div className="absolute -inset-6 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06),transparent_60%)] blur-xl" />

              <img
                src={RIGHT_IMAGE}
                alt="Download App"
                className="
                  relative
                  w-[320px] sm:w-[420px] lg:w-[560px]
                  h-auto
                  object-contain
                "
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadBanner;
