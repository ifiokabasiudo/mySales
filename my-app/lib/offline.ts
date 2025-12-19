// lib/offline.ts
import {
  db,
  QuickSale,
  InventoryItem,
  InventorySale,
  ReconciliationLink,
  PendingSync,
} from "./db";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function dateNow() {
  return formatDate(new Date());
}

function deriveQuickSaleStatus(
  reconciled: number,
  total: number
): "pending" | "partial" | "completed" {
  if (reconciled <= 0) return "pending";
  if (reconciled < total) return "partial";
  return "completed"; // >= total
}

// --- Offline Insert with trigger-like logic ---
export async function offlineInsert<T extends Record<string, any>>(
  table: PendingSync["table"],
  row: T
) {
  const id = (row as any).id ?? crypto.randomUUID();
  const now = dateNow();
  const prepare = { ...row, id, created_at: now, updated_at: now };

  switch (table) {
    case "inventory_sales": {
      const sale = prepare as unknown as InventorySale;

      console.log("Offline prepare, ", sale);
      // get item
      const item = await db.inventory_items.get(sale.item_id);
      if (!item) throw new Error("Item not found");

      // deduct stock like trigger
      if (item.stock_quantity < sale.quantity)
        throw new Error("Insufficient stock");
      item.stock_quantity -= sale.quantity;
      await db.inventory_items.put(item);

      // calculate total_amount like trigger
      sale.total_amount = sale.selling_price * sale.quantity;

      await db.inventory_sales.put(sale);
      break;
    }

    case "reconciliation_links": {
      const inventorySale = await db.inventory_sales.get(
        prepare.inventory_sales_id
      );

      if (!inventorySale || inventorySale.soft_deleted) {
        throw new Error("Inventory sale not found or already reversed");
      }

      const sale = await db.quick_sales.get(prepare.quick_sales_id);
      if (!sale) throw new Error("Quick sale not found");

      sale.reconciled_amount += prepare.linked_amount;

      // 2. Clamp (offline safety)
      sale.reconciled_amount = Math.min(
        sale.reconciled_amount,
        sale.total_amount
      );

      // 3. Derive status
      sale.status = deriveQuickSaleStatus(
        sale.reconciled_amount,
        sale.total_amount
      );

      // apply reconciliation like trigger
      // sale.reconciled_amount += prepare.linked_amount;

      // // update status like trigger
      // sale.status = deriveQuickSaleStatus(
      //   sale.reconciled_amount,
      //   sale.total_amount
      // );
      // sale.reconciled_amount === 0
      //   ? "pending"
      //   : sale.reconciled_amount < sale.total_amount
      //   ? "partial"
      //   : "completed";

      await db.quick_sales.put(sale);
      await db.reconciliation_links.put(
        prepare as unknown as ReconciliationLink
      );
      break;
    }

    case "quick_sales":
      await db.quick_sales.put(prepare as unknown as QuickSale);
      break;

    case "inventory_items":
      await db.inventory_items.put(prepare as unknown as InventoryItem);
      break;
  }

  console.log("This is the prepare: ", prepare);

  // queue for sync
  await db.pending_sync.add({
    table,
    action: "insert",
    payload: prepare,
    created_at: now,
    tries: 0,
  } as PendingSync);

  return prepare;
}

// --- Offline Update with trigger-like logic ---
export async function offlineUpdate<T extends Record<string, any>>(
  table: PendingSync["table"],
  row: T
) {
  const now = dateNow();
  const prepare = { ...row, updated_at: now };

  switch (table) {
    case "inventory_sales": {
      const sale = prepare as unknown as InventorySale;
      const oldSale = await db.inventory_sales.get(sale.id);
      if (!oldSale) throw new Error("Sale not found");

      const links = await db.reconciliation_links
        .where("inventory_sales_id")
        .equals(sale.id)
        .filter((l) => !l.soft_deleted)
        .toArray();

      if (links.length > 0) {
        throw new Error(
          "This sale has been reconciled and cannot be edited. Reverse instead."
        );
      }

      // revert old stock first
      const item = await db.inventory_items.get(oldSale.item_id);
      if (!item) throw new Error("Item not found");
      item.stock_quantity += oldSale.quantity;

      // deduct new stock
      if (item.stock_quantity < sale.quantity)
        throw new Error("Insufficient stock");
      item.stock_quantity -= sale.quantity;
      await db.inventory_items.put(item);

      // recalc total_amount
      sale.total_amount = sale.selling_price * sale.quantity;
      await db.inventory_sales.put(sale);
      break;
    }

    // case "reconciliation_links": {
    //   const oldLink = await db.reconciliation_links.get(prepare.id);
    //   if (!oldLink) throw new Error("Link not found");

    //   const sale = await db.quick_sales.get(oldLink.quick_sales_id);
    //   if (!sale) throw new Error("Quick sale not found");

    //   // reverse old linked_amount
    //   sale.reconciled_amount -= oldLink.linked_amount;

    //   // apply new linked_amount
    //   sale.reconciled_amount += prepare.linked_amount;

    //   // update status
    //   sale.status =
    //     sale.reconciled_amount === 0
    //       ? "pending"
    //       : sale.reconciled_amount < sale.total_amount
    //       ? "partial"
    //       : "completed";

    //   await db.quick_sales.put(sale);
    //   await db.reconciliation_links.put(
    //     prepare as unknown as ReconciliationLink
    //   );
    //   break;
    // }
    case "reconciliation_links":
      throw new Error(
        "Reconciliation entries cannot be edited. Reverse instead."
      );

    case "quick_sales": {
      const existing = await db.quick_sales.get(prepare.id);

      if (existing?.reconciled_amount && existing?.reconciled_amount > 0) {
        throw new Error(
          "This sale has been partially or fully paid and cannot be edited"
        );
      }

      await db.quick_sales.put(prepare as unknown as QuickSale);
      break;
    }

    case "inventory_items": {
      await db.inventory_items.put(prepare as unknown as InventoryItem);
      break;
    }
  }

  // queue sync
  await db.pending_sync.add({
    table,
    action: "update",
    payload: prepare,
    created_at: now,
    tries: 0,
  } as PendingSync);

  return prepare;
}

// --- Offline Soft Delete with trigger-like logic ---
export async function offlineSoftDelete(
  table: PendingSync["table"],
  id: string,
  reason?: string
) {
  const now = dateNow();

  switch (table) {
    case "inventory_sales": {
      const sale = await db.inventory_sales.get(id);
      if (!sale) throw new Error("Sale not found");

      const links = await db.reconciliation_links
        .where("inventory_sales_id")
        .equals(id)
        .filter((l) => !l.soft_deleted)
        .toArray();

      if (links.length > 0) {
        throw new Error(
          "This sale is reconciled. Reverse the reconciliation before deleting."
        );
      }

      // restore stock like trigger
      const item = await db.inventory_items.get(sale.item_id);
      if (item && !sale.soft_deleted) {
        item.stock_quantity += sale.quantity;
        await db.inventory_items.put(item);
      }

      await db.inventory_sales.put({
        ...sale,
        soft_deleted: true,
        deleted_reason: reason,
        deleted_at: now,
        updated_at: now,
      });
      break;
    }

    case "reconciliation_links": {
      const link = await db.reconciliation_links.get(id);
      if (!link) throw new Error("Link not found");

      const sale = await db.quick_sales.get(link.quick_sales_id);
      if (sale && !link.soft_deleted) {
        sale.reconciled_amount = Math.max(
          0,
          sale.reconciled_amount - link.linked_amount
        );
        sale.status = deriveQuickSaleStatus(
          sale.reconciled_amount,
          sale.total_amount
        );
        // sale.reconciled_amount === 0
        //   ? "pending"
        //   : sale.reconciled_amount < sale.total_amount
        //   ? "partial"
        //   : "completed";
        await db.quick_sales.put(sale);
      }

      await db.reconciliation_links.put({
        ...link,
        soft_deleted: true,
        deleted_reason: reason,
        deleted_at: now,
        updated_at: now,
      });
      break;
    }

    case "quick_sales": {
      const qs = await db.quick_sales.get(id);
      if (!qs) throw new Error("Quick sale not found");

      if (qs.reconciled_amount > 0) {
        throw new Error("This sale has payments linked and cannot be deleted");
      }

      await db.quick_sales.put({
        ...qs,
        soft_deleted: true,
        deleted_reason: reason,
        deleted_at: now,
        updated_at: now,
      });
      break;
    }

    case "inventory_items": {
      const item = await db.inventory_items.get(id);
      if (!item) throw new Error("Item not found");

      const linkedSales = await db.inventory_sales
        .where("item_id")
        .equals(id)
        .toArray();

      if (linkedSales.some((s) => !s.soft_deleted)) {
        throw new Error(
          "Cannot delete item: You've already sold it. Try editing instead"
        );
      }

      await db.inventory_items.put({
        ...item,
        soft_deleted: true,
        deleted_reason: reason,
        deleted_at: now,
        updated_at: now,
      });
      break;
    }
  }

  // queue for sync
  await db.pending_sync.add({
    table,
    action: "soft_delete",
    payload: { id, reason },
    created_at: now,
    tries: 0,
  } as PendingSync);
}
