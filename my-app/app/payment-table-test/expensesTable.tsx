"use client";

import { DataTable } from "./data-table";
import { expensesColumns } from "./expensesColumns";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export default function ExpensesTable() {
  const items = useLiveQuery(() => db.expenses.toArray(), []) ?? [];

  const dataForTable = items.map((item) => ({
    id: item.id,
    // item_id: item.item_id,
    phone: item.phone,
    category: item.category,
    quantity: item.quantity,
    unit_cost: item.unit_cost,
    total_cost: item.total_cost,
    amount: item.amount,
    type: item.type,
    // payment_type: item.payment_type,
    soft_deleted: item.soft_deleted,
    updated_at: item.updated_at ?? item.created_at,
  }));

  const finalData = dataForTable.filter((row) => !row.soft_deleted);

  console.log("These are the items: ", items);

  const filters = [
    { id: "category", name: "Category" },
    { id: "quantity", name: "Quantity" },
    { id: "unit_cost", name: "Unit Cost" },
    { id: "total_cost", name: "Total Cost" },
    { id: "amount", name: "Amount" },
    { id: "updated_at", name: "Date" },
  ];

  const extras = {
    initialFilter: "category",
    initialPlaceholder: "Category",
    numericalCols: ["total_cost", "quantity", "unit_cost", "amount"],
    monetaryCols: ["total_cost", "unit_cost", "amount"],
    nonMonetaryCols: ["quantity"],
  };

  return (
    <DataTable
      columns={expensesColumns}
      data={finalData}
      filters={filters}
      extras={extras}
    />
  );
}
