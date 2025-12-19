"use client"

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../lib/db";

export function NonReconciledSales() {
  const items = useLiveQuery(() => db.quick_sales.toArray(), []) ?? [];

  const dataForTable = items
    .filter((item) => !item.soft_deleted && item.status !== "completed")
    .map((item) => ({
      id: item.id,
      total_amount: item.total_amount,
      status: item.status,
      note: item.note,
      reconciled_amount: item.reconciled_amount,
      soft_deleted: item.soft_deleted,
    }));

  return dataForTable;
}
