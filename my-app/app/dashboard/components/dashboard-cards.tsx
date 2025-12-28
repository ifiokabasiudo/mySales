"use client";

import { useState, useEffect } from "react";
import { calculateProfit } from "../../profits/components/calculateProfit";
import { ProfitPeriodDropdown, Period } from "./profit-period";

const periodLabelMap: Record<Period, string> = {
  daily: "Today's",
  weekly: "This Week's",
  monthly: "This Month's",
  yearly: "This Year's",
};

export default function DashboardCards() {
  const [period, setPeriod] = useState<Period>("daily");
  const [profitData, setProfitData] = useState<{
    period: Period;
    revenue: number;
    cost: number;
    profit: number;
  } | null>(null);
  const periods: Period[] = ["daily", "weekly", "monthly", "yearly"];

  useEffect(() => {
    calculateProfit(period).then((res) => {
      console.log("PROFIT DEBUG: ", res);
      setProfitData(res);
    });
  }, [period]);

  // const cards = [
  //   {
  //     name: `${periodLabelMap[period]} Profit`,
  //     links: [
  //       { name: "", href: "#", isButton: false },
  //       { name: "", href: "" },
  //     ],
  //     value: profitData ? profitData.profit : 0,
  //   },
  //   {
  //     name:  `${periodLabelMap[period]} Sales`,
  //     links: [
  //       { name: "Sales History", href: "/dashboard/addSale/inventory-sale", isButton: false },
  //       { name: "Add Sales", href: "/dashboard/addSale", isButton: true },
  //     ],
  //     value: profitData ? profitData.revenue : 0,
  //   },
  //   {
  //     name: `${periodLabelMap[period]} Expenses`,
  //     links: [
  //       { name: "Expense History", href: "/table/expenses", isButton: false },
  //       { name: "Add Expense", href: "/expenses", isButton: true },
  //     ],
  //     value: profitData ? profitData.cost : 0,
  //   },
  // ];
  const cards = [
    {
      type: "profit",
      name: `${periodLabelMap[period]} Profit`,
      value: profitData ? profitData.profit : 0,
    },
    {
      type: "sales",
      name: `${periodLabelMap[period]} Sales`,
      links: [
        {
          name: "Sales History",
          href: "/dashboard/addSale/inventory-sale",
          isButton: false,
        },
        { name: "Add Sales", href: "/dashboard/addSale", isButton: true },
      ],
      value: profitData ? profitData.revenue : 0,
    },
    {
      type: "expenses",
      name: `${periodLabelMap[period]} Expenses`,
      links: [
        { name: "Expense History", href: "/table/expenses", isButton: false },
        { name: "Add Expense", href: "/expenses", isButton: true },
      ],
      value: profitData ? profitData.cost : 0,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4 tracking-wide">
      {cards.map((card, i) => (
        <div key={i} className="bg-green-700 text-white rounded-xl p-4 shadow">
          <div className="flex justify-between">
            {/* Left */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm opacity-90">{card.name}</h3>
              </div>
              <p className="text-xl font-bold">
                ₦{Number(card.value).toLocaleString()}
              </p>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-3 text-sm items-end">
              {/* 🔹 PROFIT → DROPDOWN */}
              {card.name.includes("Profit") && (
                <ProfitPeriodDropdown value={period} onChange={setPeriod} />
              )}

              {/* 🔹 SALES / EXPENSES → HISTORY LINKS */}
              {"links" in card &&
                card.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.href}
                    className={`${
                      link.isButton
                        ? "bg-white text-green-700 px-3 py-1 rounded-full hover:bg-slate-200 transition-colors"
                        : "hover:text-slate-200"
                    }`}
                  >
                    {`${link.isButton ? "+" : ""} ${link.name}`}
                  </a>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // return (
  //   <div className="flex flex-col gap-4 tracking-wide">
  //     {cards.map((card, i) => (
  //       <div key={i} className="bg-green-700 text-white rounded-xl p-4 shadow">
  //         <div className="flex justify-between">
  //           <div className="flex flex-col gap-3">
  //             <h3 className="text-sm opacity-90">{card.name}</h3>
  //             <p className="text-xl font-bold">
  //               ₦{Number(card.value).toLocaleString()}
  //             </p>
  //           </div>
  //           <div className={`flex flex-col gap-3 text-sm`}>
  //             {card.links.map((link, idx) =>
  //               link.name ? (
  //                 <a
  //                   key={idx}
  //                   href={link.href}
  //                   className={`${
  //                     link.isButton
  //                       ? "bg-white text-green-700 px-3 py-1 rounded-full hover:bg-slate-200 transition-colors"
  //                       : "text-right hover:text-slate-200"
  //                   }`}
  //                 >
  //                   {`${link.isButton ? `+` : ""} ${link.name}`}
  //                 </a>
  //               ) : null
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     ))}
  //   </div>
  // );
}
