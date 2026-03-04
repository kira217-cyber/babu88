import React, { useEffect, useMemo, useRef, useState } from "react";
import CountUp from "react-countup";
import { api } from "../../api/axios";
import Loading from "../Loading/Loading";

// fallback images
const FALLBACK_BG =
  "https://dhoni88.co/static/image/homepage/jackpot_background_en.jpg";
const FALLBACK_MINI = "https://dhoni88.co/static/image/homepage/mini_box.png";
const FALLBACK_GRAND = "https://dhoni88.co/static/image/homepage/grand_box.png";
const FALLBACK_MAJOR = "https://dhoni88.co/static/image/homepage/major_box.png";

const n = (v, def = 0) => {
  const num = Number(v);
  return Number.isFinite(num) ? num : def;
};

const clampMin = (x, min) => (x < min ? min : x);

/*
AUTO INCREASE HOOK
admin set base -> then increase forever
*/
const useAutoIncrease = (base, opts = {}) => {
  const { ratePerSec = 1, tickMs = 120 } = opts;

  const [val, setVal] = useState(() => n(base, 0));
  const lastRef = useRef(Date.now());
  const baseRef = useRef(n(base, 0));

  useEffect(() => {
    const nextBase = n(base, 0);
    baseRef.current = clampMin(nextBase, baseRef.current);
    setVal((prev) => clampMin(prev, baseRef.current));
  }, [base]);

  useEffect(() => {
    lastRef.current = Date.now();

    const t = setInterval(() => {
      const now = Date.now();
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;

      const inc = ratePerSec * dt;

      setVal((prev) => {
        const next = prev + inc;
        return clampMin(next, baseRef.current);
      });
    }, tickMs);

    return () => clearInterval(t);
  }, [ratePerSec, tickMs]);

  return val;
};

const JackpotCard = ({ label, boxImg, value, colorClass }) => {
  const [prev, setPrev] = useState(n(value, 0));

  useEffect(() => {
    const next = n(value, 0);
    setPrev((p) => (next >= p ? p : p));
  }, [value]);

  return (
    <div className="relative w-full">
      <img
        src={boxImg}
        alt={`${label} box`}
        className="w-full h-auto select-none pointer-events-none mt-4"
        draggable={false}
      />

      <div className="absolute left-1/2 -translate-x-1/2 bottom-[10%] w-[78%]">
        <div className={["text-center font-bold", colorClass].join(" ")}>
          <CountUp
            start={prev}
            end={n(value, 0)}
            duration={0.9}
            decimals={2}
            separator=","
            decimal="."
            preserveValue
            onEnd={() => setPrev(n(value, 0))}
          />
        </div>
      </div>
    </div>
  );
};

const Jackpot = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const fallbackTargets = useMemo(
    () => ({
      miniAmount: 1071.44,
      grandAmount: 17360.96,
      majorAmount: 12670.31,
    }),
    [],
  );

  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(true);

  const [base, setBase] = useState({
    mini: fallbackTargets.miniAmount,
    grand: fallbackTargets.grandAmount,
    major: fallbackTargets.majorAmount,
  });

  /*
  LOAD CONFIG FROM SERVER
  */
  useEffect(() => {
    let alive = true;

    const fetchCfg = async () => {
      try {
        const res = await api.get("/api/jackpot");

        if (!alive) return;

        const data = res.data?.data || null;

        setCfg(data);

        const nextMini = n(data?.miniAmount, base.mini);
        const nextGrand = n(data?.grandAmount, base.grand);
        const nextMajor = n(data?.majorAmount, base.major);

        setBase((prev) => ({
          mini: clampMin(nextMini, prev.mini),
          grand: clampMin(nextGrand, prev.grand),
          major: clampMin(nextMajor, prev.major),
        }));
      } catch (err) {
        if (!alive) return;
        setCfg(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchCfg();

    const t = setInterval(fetchCfg, 10000);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const isActive = cfg?.isActive ?? true;

  const bg = cfg?.bgImage ? `${API_URL}${cfg.bgImage}` : FALLBACK_BG;

  const miniBox = cfg?.miniBoxImage
    ? `${API_URL}${cfg.miniBoxImage}`
    : FALLBACK_MINI;

  const grandBox = cfg?.grandBoxImage
    ? `${API_URL}${cfg.grandBoxImage}`
    : FALLBACK_GRAND;

  const majorBox = cfg?.majorBoxImage
    ? `${API_URL}${cfg.majorBoxImage}`
    : FALLBACK_MAJOR;

  const miniAmount = useAutoIncrease(base.mini, { ratePerSec: 0.4 });
  const grandAmount = useAutoIncrease(base.grand, { ratePerSec: 6.5 });
  const majorAmount = useAutoIncrease(base.major, { ratePerSec: 1.4 });

  if (loading) return <Loading open />;

  if (!isActive) return null;

  return (
    <div className="md:hidden w-full px-3">
      <div
        className="w-full h-40  overflow-hidden border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.55)]"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="px-3 pb-3 pt-18">
          <div className="grid grid-cols-3 gap-6 items-end">
            <JackpotCard
              label="MINI"
              boxImg={miniBox}
              value={miniAmount}
              colorClass="text-lime-100"
            />

            <div className="scale-[1.20]">
              <JackpotCard
                label="GRAND"
                boxImg={grandBox}
                value={grandAmount}
                colorClass="text-yellow-100"
              />
            </div>

            <JackpotCard
              label="MAJOR"
              boxImg={majorBox}
              value={majorAmount}
              colorClass="text-blue-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jackpot;
