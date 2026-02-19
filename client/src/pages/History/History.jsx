// src/pages/Profile/History/History.jsx
import React, { useMemo, useState } from "react";
import { useLanguage } from "../../Context/LanguageProvider";

// ✅ Placeholder sections (replace with your real components later)
const DepositHistory = () => (
  <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
    <div className="text-[14px] font-extrabold text-black">Deposit History</div>
    <p className="mt-2 text-[13px] text-black/65">
      Here will show your deposit history (API data).
    </p>
  </div>
);

const WithdrawalHistory = () => (
  <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
    <div className="text-[14px] font-extrabold text-black">
      Withdrawal History
    </div>
    <p className="mt-2 text-[13px] text-black/65">
      Here will show your withdrawal history (API data).
    </p>
  </div>
);

const TransferHistory = () => (
  <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
    <div className="text-[14px] font-extrabold text-black">
      Transfer History
    </div>
    <p className="mt-2 text-[13px] text-black/65">
      Here will show your transfer history (API data).
    </p>
  </div>
);

const BonusHistory = () => (
  <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
    <div className="text-[14px] font-extrabold text-black">Bonus History</div>
    <p className="mt-2 text-[13px] text-black/65">
      Here will show your bonus history (API data).
    </p>
  </div>
);

const TurnoverHistory = () => (
  <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
    <div className="text-[14px] font-extrabold text-black">
      Turnover History
    </div>
    <p className="mt-2 text-[13px] text-black/65">
      Here will show your turnover history (API data).
    </p>
  </div>
);

const BetHistory = () => (
  <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
    <div className="text-[14px] font-extrabold text-black">Bet History</div>
    <p className="mt-2 text-[13px] text-black/65">
      Here will show your bet history (API data).
    </p>
  </div>
);

const RedeemHistory = () => (
  <div className="bg-white rounded-xl border border-black/10 p-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
    <div className="text-[14px] font-extrabold text-black">Redeem History</div>
    <p className="mt-2 text-[13px] text-black/65">
      Here will show your redeem history (API data).
    </p>
  </div>
);

const History = () => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const tabs = useMemo(
    () => [
      {
        id: "deposit",
        name: t("ডিপোজিট হিস্ট্রি", "Deposit History"),
        component: <DepositHistory />,
      },
      {
        id: "withdraw",
        name: t("উইথড্রল হিস্ট্রি", "Withdrawal History"),
        component: <WithdrawalHistory />,
      },
      {
        id: "transfer",
        name: t("ট্রান্সফার হিস্ট্রি", "Transfer History"),
        component: <TransferHistory />,
      },
      {
        id: "bonus",
        name: t("বোনাস হিস্ট্রি", "Bonus History"),
        component: <BonusHistory />,
      },
      {
        id: "turnover",
        name: t("টার্নওভার হিস্ট্রি", "Turnover History"),
        component: <TurnoverHistory />,
      },
      {
        id: "bet",
        name: t("বেট হিস্ট্রি", "Bet History"),
        component: <BetHistory />,
      },
      {
        id: "redeem",
        name: t("রিডিম হিস্ট্রি", "Redeem History"),
        component: <RedeemHistory />,
      },
    ],
    [isBangla],
  );

  // ✅ Default active like screenshot: Deposit History
  const [activeTab, setActiveTab] = useState("deposit");

  return (
    <div className="w-full">
      {/* ✅ Same container style like screenshot */}
      <div className="bg-white rounded-xl border border-black/10 p-5 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        {/* Title */}
        <div className="text-[18px] font-extrabold text-black">
          {t("হিস্ট্রি", "History")}
        </div>

        {/* Sub label */}
        <div className="mt-4 text-[13px] font-semibold text-black/70">
          {t("হিস্ট্রি টাইপ", "History Type")}
        </div>

        {/* Tabs */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {tabs.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  px-4 py-2 rounded-lg text-[13px] font-semibold transition
                  border border-black/10
                  ${
                    isActive
                      ? "bg-[#f5c400] text-black shadow-[0_8px_16px_rgba(245,196,0,0.22)]"
                      : "bg-[#f3f3f3] text-black/60 hover:text-black hover:bg-[#e9e9e9]"
                  }
                `}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mt-5 sm:mt-6">
        {tabs.find((x) => x.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default History;
