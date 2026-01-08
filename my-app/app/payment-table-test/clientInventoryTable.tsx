// app/demo/ClientInventoryTable.tsx
"use client";

import { DataTable } from "./data-table";
import { columns } from "./InventoryItemsColumns";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";


export default function ClientInventoryTable() {
  const items = useLiveQuery(() => db.inventory_items.toArray(), []) ?? [];

  const dataForTable = items.map(item => ({
    id:item.id,
    name: item.name,
    stock_quantity: item.stock_quantity,
    unit_price: item.unit_price,
    soft_deleted: item.soft_deleted,
    updated_at: item.updated_at ?? item.created_at,
  }));

  const finalData = dataForTable.filter(row => !row.soft_deleted);

  console.log("These are the items: ", items)

  const filters = [
    {id: "name", name: "Item Name",},
    {id: "stock_quantity", name: "Quantity",},
    {id: "unit_price", name: "Unit Price",},
    {id: "updated_at", name: "Date",},
  ]

  const extras = {
    initialFilter: "name",
    initialPlaceholder: "Item Name",
    numericalCols: ["unit_price", "stock_quantity"],
    monetaryCols: ["unit_price"],
    nonMonetaryCols: ["stock_quantity"]
  }

  return <DataTable columns={columns} data={finalData} filters={filters} extras={extras} />;
}
