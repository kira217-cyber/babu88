import React, { useEffect, useState } from "react";
import loading from "../../assets/Loading.gif";
import loading2 from "../../assets/Loading2.png";

const Loading = ({ open = false, text = "" }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  if (!open) return null;

  /* 📱 MOBILE LOADER */
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[999999]">
        <img
          src={loading2}
          alt="Loading"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  /* 💻 DESKTOP LOADER */
  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Loader */}
      <div className="relative flex flex-col items-center justify-center">
        <div className="loader-wrap">
          <span className="pulse-ring pulse-1" />
          <span className="pulse-ring pulse-2" />

          <div className="loader-core">
            <img
              src={loading}
              alt="Loading"
              className="h-[88px] w-auto select-none pointer-events-none"
              draggable={false}
            />
          </div>
        </div>
      </div>

      <style>{`
        .loader-wrap{
          position: relative;
          width: 210px;
          height: 210px;
          border-radius: 9999px;
          overflow: visible;
          display: flex;
          align-items: center;
          justify-content: center;
          isolation: isolate;
        }

        .loader-core{
          width: 200px;
          height: 200px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.95);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index: 2;

          border: 3px solid #f5c400;
          box-shadow:
            0 0 0 4px rgba(245,196,0,0.18),
            0 0 18px rgba(245,196,0,0.45),
            0 0 36px rgba(245,196,0,0.25);
        }

        .pulse-ring{
          position:absolute;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          transform: translate(-50%, -50%) scale(0.88);
          border-radius: 9999px;
          border: 2px solid rgba(245,196,0,0.65);
          opacity: 0;
          z-index: 1;
          pointer-events: none;

          box-shadow:
            0 0 14px rgba(245,196,0,0.35),
            0 0 30px rgba(245,196,0,0.22);
        }

        .pulse-1{
          animation: pulseSpread 1.35s ease-out infinite;
        }

        .pulse-2{
          animation: pulseSpread 1.35s ease-out infinite;
          animation-delay: 0.45s;
        }

        @keyframes pulseSpread{
          0% {
            transform: translate(-50%, -50%) scale(0.88);
            opacity: 0;
          }
          18% {
            opacity: 0.85;
          }
          55% {
            opacity: 0.28;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.32);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
