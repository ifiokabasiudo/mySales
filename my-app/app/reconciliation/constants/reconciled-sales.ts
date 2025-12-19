"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../lib/db";

export function useReconciliationDetails(quickSaleId: string) {
  return (
    useLiveQuery(async () => {
      if (!quickSaleId) return [];

      // 1️⃣ get reconciliation links for this sale
      const links = await db.reconciliation_links
        .where("quick_sales_id")
        .equals(quickSaleId)
        .filter((l) => !l.soft_deleted)
        .toArray();

      // 2️⃣ collect inventory sale ids
      const inventorySaleIds = links.map((l) => l.inventory_sales_id);

      // 3️⃣ fetch inventory sales
      const inventorySales = await db.inventory_sales
        .where("id")
        .anyOf(inventorySaleIds)
        .toArray();

      // 4️⃣ collect item ids
      const itemIds = inventorySales.map((s) => s.item_id);

      // 5️⃣ fetch inventory items
      const items = await db.inventory_items
        .where("id")
        .anyOf(itemIds)
        .toArray();

      // 6️⃣ build lookup maps
      const saleMap = new Map(inventorySales.map((s) => [s.id, s]));
      const itemMap = new Map(items.map((i) => [i.id, i]));

      // 7️⃣ return UI-ready data
      return links.map((link) => {
        const sale = saleMap.get(link.inventory_sales_id);
        const item = sale ? itemMap.get(sale.item_id) : null;

        return {
          reconciliation_id: link.id,
          inventory_sale_id: link.inventory_sales_id,
          item_name: item?.name ?? "Unknown item",
          quantity: sale?.quantity ?? 0,
          selling_price: sale?.selling_price ?? 0,
          total: sale?.total_amount ?? link.linked_amount,
          linked_amount: link.linked_amount,
          created_at: link.created_at,
        };
      });
    }, [quickSaleId]) ?? []
  );
}
