"use client"

import { DataTable } from "./data-table";
import { quickSalesColumns } from "./quickSalesColumns";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export default function QuickSalesTable() {
  const items = useLiveQuery(() => db.quick_sales.toArray(), []) ?? [];

  const dataForTable = items.map((item) => ({
    id: item.id,
    phone: item.phone,
    reconciled_amount: item.reconciled_amount,
    status: item.status,
    note: item.note,
    mode: item.mode,
    soft_deleted: item.soft_deleted,
    total_amount: item.total_amount,
    updated_at: item.updated_at ?? item.created_at,
  }));

  const finalData = dataForTable.filter((row) => !row.soft_deleted);

  console.log("These are the items: ", items);

  const filters = [
    { id: "total_amount", name: "total Amount" },
    { id: "reconciled_amount", name: "Allocated Amount" },
    { id: "note", name: "Side Note"},
    { id: "mode", name: "Mode of Payment" },
    { id: "status", name: "Status" },
    { id: "updated_at", name: "Date" },
  ];

  const extras = {
    initialFilter: "total_amount",
    initialPlaceholder: "Total Amount",
    numericalCols: ["total_amount", "reconciled_amount"],
    monetaryCols: ["total_amount", "reconciled_amount"],
    nonMonetaryCols: [""]
  }

  return (
    <DataTable columns={quickSalesColumns} data={finalData} filters={filters} extras={extras} />
  );
}
