// lib/sync/tableMap.ts
"use client"

import { db } from "@/lib/db";

export const tableMap = {
  inventory_items: db.inventory_items,
  inventory_batches: db.inventory_batches,
  inventory_sales: db.inventory_sales,
  quick_sales: db.quick_sales,
  reconciliation_links: db.reconciliation_links,
  expenses: db.expenses,
} as const;
