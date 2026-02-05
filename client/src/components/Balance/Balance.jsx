import React, { useMemo } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { RiWallet3Line } from "react-icons/ri";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { useLanguage } from "../../Context/LanguageProvider";

const Balance = ({
  balance = 0,
  onRefresh = () => {},
  onDeposit = () => {},
  onWithdraw = () => {},
  onAccount = () => {},
}) => {
  const { isBangla } = useLanguage();

  // ✅ text dictionary
  const t = useMemo(
    () => ({
      withdraw: isBangla ? "উইথড্র" : "Withdraw",
      deposit: isBangla ? "ডিপোজিট" : "Deposit",
      account: isBangla ? "আমারত" : "Account",
      refresh: isBangla ? "রিফ্রেশ" : "Refresh",
    }),
    [isBangla],
  );

  return (
    // ✅ Mobile only + exact-like bar
    <section className="w-full bg-white md:hidden border-t border-black/10 mt-2">
      <div className="mx-auto w-full px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Balance pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[#f2f2f2] rounded-md px-3 py-2 border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
              <span className="text-[13px] font-bold text-black/80">৳</span>
              <span className="text-[13px] font-extrabold text-black">
                {Number(balance).toFixed(2)}
              </span>

              <button
                type="button"
                onClick={onRefresh}
                className="ml-2 h-7 w-7 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black/5 active:scale-[0.98] transition"
                aria-label={t.refresh}
                title={t.refresh}
              >
                <FaSyncAlt className="text-black/70 text-[12px]" />
              </button>
            </div>
          </div>

          {/* Right: 3 quick actions */}
          <div className="flex items-center gap-3">
            {/* Withdraw */}
            <button
              type="button"
              onClick={onWithdraw}
              className="flex flex-col items-center gap-1"
            >
              <span className="h-10 w-10 rounded-lg bg-black flex items-center justify-center shadow-sm active:scale-[0.98] transition">
                <HiOutlineShieldCheck className="text-white text-[20px]" />
              </span>
              <span className="text-[12px] font-semibold text-black/80">
                {t.withdraw}
              </span>
            </button>

            {/* Deposit */}
            <button
              type="button"
              onClick={onDeposit}
              className="flex flex-col items-center gap-1"
            >
              <span className="h-10 w-10 rounded-lg bg-black flex items-center justify-center shadow-sm active:scale-[0.98] transition">
                <RiWallet3Line className="text-white text-[20px]" />
              </span>
              <span className="text-[12px] font-semibold text-black/80">
                {t.deposit}
              </span>
            </button>

            {/* Account */}
            <button
              type="button"
              onClick={onAccount}
              className="flex flex-col items-center gap-1"
            >
              <span className="h-10 w-10 rounded-lg bg-black flex items-center justify-center shadow-sm active:scale-[0.98] transition">
                <MdOutlineAccountBalanceWallet className="text-white text-[20px]" />
              </span>
              <span className="text-[12px] font-semibold text-black/80">
                {t.account}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Balance;
