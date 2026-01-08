// lib/offline.ts
import {
  db,
  QuickSale,
  InventoryItem,
  InventorySale,
  ReconciliationLink,
  InventoryBatch,
  PendingSync,
  Expenses,
} from "./db";

function dateNow() {
  return new Date().toISOString();
}

function deriveQuickSaleStatus(
  reconciled: number,
  total: number
): "pending" | "partial" | "completed" {
  if (reconciled <= 0) return "pending";
  if (reconciled < total) return "partial";
  return "completed"; // >= total
}

function mergeUpdate<T>(
  existing: T,
  patch: Partial<T>,
  computed: Partial<T> = {}
): T {
  return {
    ...existing,
    ...patch,
    ...computed,
  };
}

async function recomputeInventoryItemOffline(itemId: string) {
  const allBatches = await db.inventory_batches
    .where("item_id")
    .equals(itemId)
    .and((b) => !b.soft_deleted && b.is_active)
    .toArray();

  const stock = allBatches
    // .filter((b) => b.is_active)
    .reduce((s, b) => s + b.quantity, 0);

    console.log("Batches: ", allBatches);

  const price = allBatches.sort((a, b) =>
    (a.created_at ?? "").localeCompare(b.created_at ?? "")
  )[0]?.unit_cost;

  console.log("DB tables:", db.tables.map(t => t.name));

  const item = await db.inventory_items.get(itemId);
  if (!item) return;

  item.stock_quantity = stock;
  if (price) item.unit_price = price;

  await db.inventory_items.put(item);
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
    case "expenses": {
      const expenses = prepare as unknown as Expenses;

      // batch.is_active = batch.quantity > 0;
      // batch.soft_deleted = false;

      await db.expenses.put(expenses);

      // 🔁 recompute item stock
      // await recomputeInventoryItemOffline(batch.item_id);
      break;
    }

    case "inventory_batches": {
      const batch = prepare as unknown as InventoryBatch;

      batch.is_active = batch.quantity > 0;
      batch.soft_deleted = false;

      await db.inventory_batches.put(batch);

      // 🔁 recompute item stock
      await recomputeInventoryItemOffline(batch.item_id);
      break;
    }

    case "inventory_sales": {
      const sale = prepare as unknown as InventorySale;

      if (!sale.batch_id) {
        const batch = await db.inventory_batches
          .where("item_id")
          .equals(sale.item_id)
          .and((b) => b.is_active && !b.soft_deleted)
          .sortBy("created_at")
          .then((b) => b[0]);

        if (!batch) throw new Error("No active batch available");

        sale.batch_id = batch.id;
      }

      const batch = await db.inventory_batches.get(sale.batch_id);
      if (!batch || batch.soft_deleted || !batch.is_active) {
        throw new Error("Invalid or inactive batch");
      }

      // 1️⃣ Validate stock
      if (sale.quantity > batch.quantity) {
        throw new Error("Insufficient batch stock");
      }

      // 2️⃣ Deduct stock
      batch.quantity -= sale.quantity;
      batch.is_active = batch.quantity > 0;

      await db.inventory_batches.put(batch);

      // 3️⃣ Snapshot cost (IMMUTABLE)
      sale.batch_unit_cost = batch.unit_cost;
      sale.batch_quantity_at_sale = sale.quantity;
      sale.total_amount = sale.quantity * sale.selling_price;

      // 4️⃣ Save sale ONCE
      await db.inventory_sales.put(sale);

      // 5️⃣ Recompute cached inventory item
      await recomputeInventoryItemOffline(sale.item_id);

      // 6️⃣ Create immutable COGS expense
      const expense: Expenses = {
        id: crypto.randomUUID(),
        phone: sale.phone,
        inventory_sales_id: sale.id,
        type: "cogs",
        category: "inventory",
        quantity: sale.quantity,
        unit_cost: sale.batch_unit_cost,
        total_cost: sale.quantity * sale.batch_unit_cost,
        amount: null,
        created_at: now,
        updated_at: now,
      };

      await db.expenses.put(expense);

      // 7️⃣ Queue expense sync
      // await db.pending_sync.add({
      //   table: "expenses",
      //   action: "insert",
      //   payload: expense,
      //   created_at: now,
      //   tries: 0,
      // } as PendingSync);

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
      // await db.inventory_items.put(prepare as unknown as InventoryItem);
      const item = prepare as unknown as InventoryItem;

      // 👇 check if this item already exists
      const existingItem = await db.inventory_items.get(item.id);

      await db.inventory_items.put(item);

      await db.pending_sync.add({
        table: "inventory_items",
        action: "insert",
        payload: item,
        created_at: now,
        tries: 0,
      } as PendingSync);

      if (!existingItem && item.stock_quantity && item.stock_quantity > 0) {
        const batchId = crypto.randomUUID();

        const batch: InventoryBatch = {
          id: batchId,
          item_id: item.id,
          phone: item.phone,
          quantity: item.stock_quantity,
          unit_cost: item.unit_price,
          is_active: true,
          soft_deleted: false,
          created_at: now,
          updated_at: now,
        };
        

        await db.inventory_batches.put(batch);

        //This extra block only exists only exists because there is no trigger for this in supabase.
        await db.pending_sync.add({
          table: "inventory_batches",
          action: "insert",
          payload: batch,
          created_at: now,
          tries: 0,
        } as PendingSync);
      }
      break;
  }

  console.log("This is the prepare: ", prepare);

  // queue for sync
  if (table != "inventory_items") {
    await db.pending_sync.add({
      table,
      action: "insert",
      payload: prepare,
      created_at: now,
      tries: 0,
    } as PendingSync);
  }

  return prepare;
}

// --- Offline Update with trigger-like logic ---
export async function offlineUpdate<T extends Record<string, any>>(
  table: PendingSync["table"],
  row: T
) {
  const now = dateNow();
  // const prepare = { ...row, updated_at: now };
  let updated: any = null;

  switch (table) {
    case "expenses": {
      const existing = await db.expenses.get(row.id);
      if (!existing) throw new Error("Expense not found");

      if (existing.type == "cogs") {
        throw new Error(
          "This expense is linked to a sale and cannot be edited"
        );
      }

      updated = mergeUpdate(existing, row, {
        soft_deleted: false,
        updated_at: now,
      });

      await db.expenses.put(updated);
      // await recomputeInventoryItemOffline(updated.item_id);
      break;
    }

    case "inventory_batches": {
      const existing = await db.inventory_batches.get(row.id);
      if (!existing) throw new Error("Batch not found");

      console.log("This is the existing in the inventory batch: ", existing)

      // 🔒 Prevent cost edits if batch has sales
      if (row.unit_cost !== undefined && row.unit_cost !== existing.unit_cost) {
        const salesCount = await db.inventory_sales
          .where("batch_id")
          .equals(existing.id)
          .and((s) => !s.soft_deleted)
          .count();

        if (salesCount > 0) {
          throw new Error("Cannot edit cost: this batch already has sales");
        }
      }

      updated = mergeUpdate(existing, row, {
        is_active: row.quantity > 0,
        soft_deleted: false,
        updated_at: now,
      });

      console.log("This is the batch update data: ", updated)

      await db.inventory_batches.put(updated);
      await recomputeInventoryItemOffline(updated.item_id);

      break;
    }

    case "inventory_sales": {
      // const sale = prepare as unknown as InventorySale;
      const existing = await db.inventory_sales.get(row.id);
      if (!existing) throw new Error("Sale not found");

      if (row.batch_id && row.batch_id !== existing.batch_id) {
        throw new Error("Changing batch on a sale is not allowed");
      }

      const links = await db.reconciliation_links
        .where("inventory_sales_id")
        .equals(existing.id)
        .filter((l) => !l.soft_deleted)
        .toArray();

      if (links.length > 0) {
        throw new Error(
          "This sale has been reconciled and cannot be edited. Reverse instead."
        );
      }

      if (!existing?.batch_id) throw new Error("Missing batch reference");

      const batch = await db.inventory_batches.get(existing.batch_id);
      if (!batch) throw new Error("Batch not found");

      // restore old quantity
      batch.quantity += existing.quantity;
      batch.is_active = true;

      // deduct new quantity
      if (batch.quantity < row.quantity)
        throw new Error("Insufficient batch stock");

      batch.quantity -= row.quantity;
      batch.is_active = batch.quantity > 0;

      updated = mergeUpdate(existing, row, {
        total_amount: row.quantity * row.selling_price,
        updated_at: now,
      });

      await db.inventory_batches.put(batch);
      await db.inventory_sales.put(updated);

      await recomputeInventoryItemOffline(updated.item_id);

      const expense = await db.expenses
        .where("inventory_sales_id")
        .equals(existing.id)
        .first();

      if (!expense) throw new Error("Expense record missing");

      expense.quantity = updated.quantity;
      expense.total_cost = updated.quantity * updated.batch_unit_cost;

      expense.updated_at = now;

      await db.expenses.put(expense);

      // await db.pending_sync.add({
      //   table: "expenses",
      //   action: "update",
      //   payload: expense,
      //   created_at: now,
      //   tries: 0,
      // } as PendingSync);

      break;
    }

    case "reconciliation_links":
      throw new Error(
        "Reconciliation entries cannot be edited. Reverse instead."
      );

    case "quick_sales": {
      const existing = await db.quick_sales.get(row.id);
      if (!existing) throw new Error("Quick sale not found");

      if (existing?.reconciled_amount > 0) {
        throw new Error(
          "This sale has been partially or fully paid and cannot be edited"
        );
      }

      updated = mergeUpdate(existing, row, {
        updated_at: now,
      });

      await db.quick_sales.put(updated);
      break;
    }

    case "inventory_items": {
      const existing = await db.inventory_items.get(row.id);
      if (!existing) throw new Error("Item not found");

      updated = mergeUpdate(existing, row, {
        updated_at: now,
      });

      await db.inventory_items.put(updated);
      break;
    }
  }

  // queue sync
  await db.pending_sync.add({
    table,
    action: "update",
    payload: updated,
    created_at: now,
    tries: 0,
  } as PendingSync);

  return updated;
}

// --- Offline Soft Delete with trigger-like logic ---
export async function offlineSoftDelete(
  table: PendingSync["table"],
  id: string,
  reason?: string
) {
  const now = dateNow();

  switch (table) {
    case "expenses": {
      const ex = await db.expenses.get(id);
      if (!ex) throw new Error("Expense not found");

      if (ex.type == "cogs") {
        throw new Error(
          "This expense is linked to a sale and cannot be deleted"
        );
      }

      await db.expenses.put({
        ...ex,
        soft_deleted: true,
        deleted_reason: reason,
        deleted_at: now,
        updated_at: now,
      });
      break;
    }

    case "inventory_batches": {
      const batchItem = await db.inventory_batches.get(id);
      if (!batchItem) throw new Error("Batch not found");

      console.log("Actually got to this point")

      const linkedSales = await db.inventory_sales
        .where("batch_id")
        .equals(id)
        .toArray();

      console.log("Didn't get here")

      if (linkedSales.some((s) => !s.soft_deleted)) {
        throw new Error(
          "Cannot delete item: You've already sold it. Try editing instead"
        );
      }

      await db.inventory_batches.put({
        ...batchItem,
        id,
        soft_deleted: true,
        deleted_reason: reason,
        deleted_at: now,
        updated_at: now,
      });

      await recomputeInventoryItemOffline(batchItem.item_id);
      break;
    }

    case "inventory_sales": {
      const sale = await db.inventory_sales.get(id);
      if (!sale || sale.soft_deleted) throw new Error("Sale not found");

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

      if (!sale.batch_id) throw new Error("Missing batch reference");

      const batch = await db.inventory_batches.get(sale.batch_id);
      if (!batch) throw new Error("Batch not found");

      // restore stock
      batch.quantity += sale.quantity;
      batch.is_active = true;

      await db.inventory_batches.put(batch);

      await recomputeInventoryItemOffline(sale.item_id);

      await db.inventory_sales.put({
        ...sale,
        soft_deleted: true,
        deleted_reason: reason,
        deleted_at: now,
        updated_at: now,
      });

      const expense = await db.expenses
        .where("inventory_sales_id")
        .equals(id)
        .first();

      if (expense && !expense.soft_deleted) {
        await db.expenses.put({
          ...expense,
          soft_deleted: true,
          deleted_reason: reason,
          deleted_at: now,
          updated_at: now,
        });
      }
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

// case "inventory_sales": {
//   const sale = prepare as unknown as InventorySale;

//   let remainingQty = sale.quantity;

//   // 1️⃣ Get all active batches FIFO
//   const batches = await db.inventory_batches
//     .where("item_id")
//     .equals(sale.item_id)
//     .and((b) => b.is_active && !b.soft_deleted)
//     .sortBy("created_at");

//   if (batches.length === 0) {
//     throw new Error("No active batch");
//   }

//   // 2️⃣ Ensure enough total stock
//   const totalAvailable = batches.reduce((s, b) => s + b.quantity, 0);
//   if (totalAvailable < remainingQty) {
//     throw new Error("Insufficient batch stock");
//   }

//   let firstBatchId: string | null = null;

//   // 3️⃣ FIFO deduction across batches
//   for (const batch of batches) {
//     if (remainingQty <= 0) break;

//     const deduct = Math.min(batch.quantity, remainingQty);

//     batch.quantity -= deduct;
//     batch.is_active = batch.quantity > 0;

//     if (!firstBatchId) {
//       firstBatchId = batch.id; // link sale to first consumed batch
//     }

//     remainingQty -= deduct;

//     await db.inventory_batches.put(batch);
//   }

//   if (remainingQty > 0) {
//     throw new Error("FIFO deduction failed");
//   }

//   // 4️⃣ Finalize sale
//   sale.batch_id = firstBatchId!;
//   sale.total_amount = sale.quantity * sale.selling_price;

//   await db.inventory_sales.put(sale);

//   // 5️⃣ Recompute cached inventory item
//   await recomputeInventoryItemOffline(sale.item_id);

//   // CREATE COGS EXPENSE
//   // const batch = await db.inventory_batches.get(sale.batch_id!);
//   // if (!batch) throw new Error("Batch not found for expense");

//   // const expense = {
//   //   id: crypto.randomUUID(),
//   //   phone: sale.phone,
//   //   inventory_sales_id: sale.id,
//   //   type: "cogs",
//   //   category: "inventory",
//   //   quantity: sale.quantity,
//   //   unit_cost: batch.unit_cost,
//   //   total_cost: sale.quantity * batch.unit_cost,
//   //   created_at: now,
//   //   updated_at: now,
//   // };
//   // 🔒 Snapshot batch data at sale time
//   sale.batch_unit_cost = batches[0].unit_cost;
//   sale.batch_quantity_at_sale = sale.quantity;

//   // Save sale first
//   await db.inventory_sales.put(sale);

//   // ✅ Create immutable COGS expense from snapshot
//   const expense: Expenses = {
//     id: crypto.randomUUID(),
//     phone: sale.phone,
//     inventory_sales_id: sale.id,
//     type: "cogs",
//     category: "inventory",
//     quantity: sale.quantity,
//     unit_cost: sale.batch_unit_cost,
//     total_cost: sale.quantity * sale.batch_unit_cost,
//     created_at: now,
//     updated_at: now,
//   };

//   await db.expenses.put(expense);

//   // await db.expenses.put(expense);

//   // queue expense sync // This extra block only exists only exists because there is no trigger for this in supabase.
//   await db.pending_sync.add({
//     table: "expenses",
//     action: "insert",
//     payload: expense,
//     created_at: now,
//     tries: 0,
//   } as PendingSync);

//   break;
// }
