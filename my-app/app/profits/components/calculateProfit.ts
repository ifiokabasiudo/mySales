import { db } from "@/lib/db";
import { getTimeRange } from "./getTimeRange";

type Period = "daily" | "weekly" | "monthly" | "yearly";

export async function calculateProfit(period: Period) {
  const { start, end } = getTimeRange(period);

  console.log("CALCULATE PROFIT DEBUG: ", { start, end });

  const sales = (
    await db.inventory_sales
      .where("created_at")
      .between(start.toISOString(), end.toISOString(), true, true)
      .toArray()
  ).filter((s) => s.soft_deleted != true);

  console.log(
    "CALCULATE PROFIT DEBUG - TIME RANGE: ",
    start.toISOString(),
    end.toISOString()
  );

  console.log("CALCULATE PROFIT DEBUG - SALES: ", sales);

  const expenses = (
    await db.expenses
      .where("created_at")
      .between(start.toISOString(), end.toISOString(), true, true)
      .toArray()
  ).filter((e) => e.soft_deleted != true);

  console.log("CALCULATE PROFIT DEBUG - EXPENSES: ", expenses);

  const revenue = sales.reduce((s, x) => s + x.total_amount, 0);
  const cost = expenses.reduce((sum, e) => {
    if (e.type === "cogs") return sum + e.total_cost;
    return sum + (e.amount ?? 0);
  }, 0);

  return {
    period,
    revenue,
    cost,
    profit: revenue - cost,
  };
}
