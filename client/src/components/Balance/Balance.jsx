import React, { useMemo } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { RiWallet3Line } from "react-icons/ri";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { useLanguage } from "../../Context/LanguageProvider";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";

const fetchBalanceColor = async () => {
  const { data } = await api.get("/api/balance-color");
  return data;
};

const shadowFrom = (s) => (s ? String(s).replaceAll("_", " ") : "");

const Balance = ({
  balance = 0,
  onRefresh = () => {},
  onDeposit = () => {},
  onWithdraw = () => {},
  onAccount = () => {},
}) => {
  const { isBangla } = useLanguage();

  const { data: colorDoc } = useQuery({
    queryKey: ["balance-color"],
    queryFn: fetchBalanceColor,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const ui = useMemo(() => {
    const d = colorDoc || {};
    return {
      sectionBg: d.sectionBg || "#ffffff",
      sectionBorderColor: d.sectionBorderColor || "#000000",
      sectionBorderOpacity: d.sectionBorderOpacity ?? 0.1,

      pillBg: d.pillBg || "#f2f2f2",
      pillBorderColor: d.pillBorderColor || "#000000",
      pillBorderOpacity: d.pillBorderOpacity ?? 0.1,
      pillRadius: d.pillRadius ?? 6,
      pillPaddingX: d.pillPaddingX ?? 12,
      pillPaddingY: d.pillPaddingY ?? 8,
      pillShadow: shadowFrom(d.pillShadow || "0_1px_0_rgba(0,0,0,0.04)"),

      currencyColor: d.currencyColor || "#000000",
      currencyOpacity: d.currencyOpacity ?? 0.8,
      currencySize: d.currencySize ?? 13,
      currencyWeight: d.currencyWeight ?? 700,

      amountColor: d.amountColor || "#000000",
      amountSize: d.amountSize ?? 13,
      amountWeight: d.amountWeight ?? 800,

      refreshBtnBg: d.refreshBtnBg || "#ffffff",
      refreshBtnBorderColor: d.refreshBtnBorderColor || "#000000",
      refreshBtnBorderOpacity: d.refreshBtnBorderOpacity ?? 0.1,
      refreshBtnSize: d.refreshBtnSize ?? 28,
      refreshBtnRadius: d.refreshBtnRadius ?? 999,
      refreshIconColor: d.refreshIconColor || "#000000",
      refreshIconOpacity: d.refreshIconOpacity ?? 0.7,
      refreshIconSize: d.refreshIconSize ?? 12,

      actionIconBoxBg: d.actionIconBoxBg || "#000000",
      actionIconBoxSize: d.actionIconBoxSize ?? 40,
      actionIconBoxRadius: d.actionIconBoxRadius ?? 8,
      actionIconColor: d.actionIconColor || "#ffffff",
      actionIconSize: d.actionIconSize ?? 20,

      actionLabelColor: d.actionLabelColor || "#000000",
      actionLabelOpacity: d.actionLabelOpacity ?? 0.8,
      actionLabelSize: d.actionLabelSize ?? 12,
      actionLabelWeight: d.actionLabelWeight ?? 600,
    };
  }, [colorDoc]);

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
    <section
      className="w-full bg-white md:hidden border-t border-black/10 mt-2"
      style={{
        backgroundColor: ui.sectionBg,
        borderTopColor: `rgba(0,0,0,${ui.sectionBorderOpacity})`,
      }}
    >
      <div className="mx-auto w-full px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Balance pill */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 bg-[#f2f2f2] rounded-md px-3 py-2 border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
              style={{
                backgroundColor: ui.pillBg,
                borderColor: `rgba(0,0,0,${ui.pillBorderOpacity})`,
                borderRadius: ui.pillRadius,
                paddingLeft: ui.pillPaddingX,
                paddingRight: ui.pillPaddingX,
                paddingTop: ui.pillPaddingY,
                paddingBottom: ui.pillPaddingY,
                boxShadow: ui.pillShadow,
              }}
            >
              <span
                className="text-[13px] font-bold text-black/80"
                style={{
                  color: ui.currencyColor,
                  opacity: ui.currencyOpacity,
                  fontSize: ui.currencySize,
                  fontWeight: ui.currencyWeight,
                }}
              >
                ৳
              </span>

              <span
                className="text-[13px] font-extrabold text-black"
                style={{
                  color: ui.amountColor,
                  fontSize: ui.amountSize,
                  fontWeight: ui.amountWeight,
                }}
              >
                {Number(balance).toFixed(2)}
              </span>

              <button
                type="button"
                onClick={onRefresh}
                className="ml-2 h-7 w-7 rounded-full bg-white border border-black/10 flex items-center justify-center hover:bg-black/5 active:scale-[0.98] transition"
                aria-label={t.refresh}
                title={t.refresh}
                style={{
                  width: ui.refreshBtnSize,
                  height: ui.refreshBtnSize,
                  borderRadius: ui.refreshBtnRadius,
                  backgroundColor: ui.refreshBtnBg,
                  borderColor: `rgba(0,0,0,${ui.refreshBtnBorderOpacity})`,
                }}
              >
                <FaSyncAlt
                  className="text-black/70 text-[12px]"
                  style={{
                    color: ui.refreshIconColor,
                    opacity: ui.refreshIconOpacity,
                    fontSize: ui.refreshIconSize,
                  }}
                />
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
              <span
                className="h-10 w-10 rounded-lg bg-black flex items-center justify-center shadow-sm active:scale-[0.98] transition"
                style={{
                  width: ui.actionIconBoxSize,
                  height: ui.actionIconBoxSize,
                  borderRadius: ui.actionIconBoxRadius,
                  backgroundColor: ui.actionIconBoxBg,
                }}
              >
                <HiOutlineShieldCheck
                  className="text-white text-[20px]"
                  style={{
                    color: ui.actionIconColor,
                    fontSize: ui.actionIconSize,
                  }}
                />
              </span>
              <span
                className="text-[12px] font-semibold text-black/80"
                style={{
                  color: ui.actionLabelColor,
                  opacity: ui.actionLabelOpacity,
                  fontSize: ui.actionLabelSize,
                  fontWeight: ui.actionLabelWeight,
                }}
              >
                {t.withdraw}
              </span>
            </button>

            {/* Deposit */}
            <button
              type="button"
              onClick={onDeposit}
              className="flex flex-col items-center gap-1"
            >
              <span
                className="h-10 w-10 rounded-lg bg-black flex items-center justify-center shadow-sm active:scale-[0.98] transition"
                style={{
                  width: ui.actionIconBoxSize,
                  height: ui.actionIconBoxSize,
                  borderRadius: ui.actionIconBoxRadius,
                  backgroundColor: ui.actionIconBoxBg,
                }}
              >
                <RiWallet3Line
                  className="text-white text-[20px]"
                  style={{
                    color: ui.actionIconColor,
                    fontSize: ui.actionIconSize,
                  }}
                />
              </span>
              <span
                className="text-[12px] font-semibold text-black/80"
                style={{
                  color: ui.actionLabelColor,
                  opacity: ui.actionLabelOpacity,
                  fontSize: ui.actionLabelSize,
                  fontWeight: ui.actionLabelWeight,
                }}
              >
                {t.deposit}
              </span>
            </button>

            {/* Account */}
            <button
              type="button"
              onClick={onAccount}
              className="flex flex-col items-center gap-1"
            >
              <span
                className="h-10 w-10 rounded-lg bg-black flex items-center justify-center shadow-sm active:scale-[0.98] transition"
                style={{
                  width: ui.actionIconBoxSize,
                  height: ui.actionIconBoxSize,
                  borderRadius: ui.actionIconBoxRadius,
                  backgroundColor: ui.actionIconBoxBg,
                }}
              >
                <MdOutlineAccountBalanceWallet
                  className="text-white text-[20px]"
                  style={{
                    color: ui.actionIconColor,
                    fontSize: ui.actionIconSize,
                  }}
                />
              </span>
              <span
                className="text-[12px] font-semibold text-black/80"
                style={{
                  color: ui.actionLabelColor,
                  opacity: ui.actionLabelOpacity,
                  fontSize: ui.actionLabelSize,
                  fontWeight: ui.actionLabelWeight,
                }}
              >
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
