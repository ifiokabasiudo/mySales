import { db } from "../../lib/db";
import { supabase } from "../../lib/supabase/client";

export async function pushPendingSales() {
  const pending = await db.pending_sync
    .where("table")
    .equals("inventory_sales")
    .toArray();

  for (const item of pending) {
    const sale = item.payload;

    // ⛔ Do not retry rejected sales
    if (sale.sync_status === "rejected") {
      await db.pending_sync.delete(item.local_id!);
      continue;
    }

    try {
      const { data, error } = await supabase.rpc(
        "confirm_inventory_sale",
        {
          p_client_sale_id: sale.client_sale_id,
          p_item_id: sale.item_id,
          p_quantity: sale.quantity,
          p_selling_price: sale.selling_price,
          p_phone: sale.phone,
          p_payment_type: sale.payment_type,
        }
      );

      if (error) throw error;

      if (data.status === "confirmed") {
        await db.inventory_sales.update(sale.id, {
          sync_status: "confirmed",
          rejection_reason: null,
        });

        await db.pending_sync.delete(item.local_id!);
      }

      if (data.status === "rejected") {
        await db.inventory_sales.update(sale.id, {
          sync_status: "rejected",
          rejection_reason: data.reason,
        });

        await db.pending_sync.delete(item.local_id!);
      }
    } catch (err) {
      // Network / transient error → retry later
      await db.pending_sync.update(item.local_id!, {
        tries: item.tries && item.tries + 1,
        last_error: String(err),
      });

      break; // stop sync loop on failure
    }
  }
}
