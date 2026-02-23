import React from "react";
import { NavLink } from "react-router";

const TabItem = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `
        relative px-4 py-3 text-[15px] font-extrabold tracking-wide
        transition
        ${
          isActive
            ? "text-yellow-400"
            : "text-white/80 hover:text-white"
        }
      `
      }
    >
      {({ isActive }) => (
        <>
          <span>{label}</span>

          {/* yellow bottom line */}
          {isActive && (
            <span
              className="
                absolute left-0 right-0 -bottom-[1px]
                h-[3px] bg-yellow-400
              "
            />
          )}
        </>
      )}
    </NavLink>
  );
};

const DepositWithdrawTabs = () => {
  return (
    <div className="block md:hidden w-full bg-black border-b border-white/10">
      <div className="flex items-center justify-between gap-2">
        <TabItem to="/profile/deposit" label="Deposit" />
        <TabItem to="/profile/auto-deposit" label="Auto Deposit" />
        <TabItem to="/profile/withdraw" label="Withdrawal" />
      </div>
    </div>
  );
};

export default DepositWithdrawTabs;