"use client";

import { DataTable } from "./data-table";
import { inventorySalesColumns } from "./inventorySalesColumns";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export default function InventorySalesTable() {
  const items = useLiveQuery(() => db.inventory_sales.toArray(), []) ?? [];

  const dataForTable = items.map((item) => ({
    id: item.id,
    item_id: item.item_id,
    phone: item.phone,
    name: item.name,
    quantity: item.quantity,
    selling_price: item.selling_price,
    total_amount: item.total_amount,
    payment_type: item.payment_type,
    soft_deleted: item.soft_deleted,
    updated_at: item.updated_at ?? item.created_at,
  }));

  const finalData = dataForTable.filter((row) => !row.soft_deleted);

  console.log("These are the items: ", items);

  const filters = [
    { id: "name", name: "Item Name" },
    { id: "quantity", name: "Quantity" },
    { id: "selling_price", name: "Selling Price" },
    { id: "total_amount", name: "Total Amount" },
    { id: "payment_type", name: "Payment Type" },
    { id: "updated_at", name: "Date" },
  ];

  const extras = {
    initialFilter: "name",
    initialPlaceholder: "Item Name",
    numericalCols: ["total_amount", "quantity", "selling_price",],
    monetaryCols: ["total_amount", "selling_price"],
    nonMonetaryCols: ["quantity"],
  };

  return (
    <DataTable
      columns={inventorySalesColumns}
      data={finalData}
      filters={filters}
      extras={extras}
    />
  );
}
