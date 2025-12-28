// hooks/useOfflineSync.ts
"use client"

import { useEffect, useRef, useState } from "react";
import { db, PendingSync } from "../lib/db";
import { supabase } from "../lib/supabase/client";

const MAX_RETRIES = 5;

export default function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const abortRef = useRef(false);

  async function processItem(item: PendingSync) {
    try {
      if (item.action === "insert") {
        // console.log("It made it here")
        // Insert to supabase
        const table = item.table;
        const payload = item.payload;

        // 🔴 SPECIAL CASE: inventory_sales
      // if (table === "inventory_sales") {
      //   const clientSaleId = crypto.randomUUID();

      //   const { error } = await supabase.rpc("create_inventory_sale", {
      //     p_client_sale_id: clientSaleId,
      //     p_item_id: payload.item_id,
      //     p_name: payload.name,
      //     p_quantity: payload.quantity,
      //     p_selling_price: payload.selling_price,
      //     p_phone: payload.phone,
      //     p_payment_type: payload.payment_type
      //     // p_auth_user_id: payload.auth_user_id,
      //   });

      //   if (error) throw error;

      //   // sale already exists locally → server created its own row
      //   // local row will be reconciled later if you want
      //   await db.pending_sync.delete(item.local_id!);
      //   return;
      // }

        // mapping logic: if payload has local id and server will return an id, we need link update
        const { data, error } = await supabase.from(table).insert(payload).select().single();

        if (error) throw error;

        // If server returned new id different from local, update local DB rows and any queued rows that reference it
        if (data && data.id && data.id !== payload.id) {
          // update local row to server id
          await db.table(table).delete(payload.id); // remove local row keyed by local id
          await db.table(table).put({ ...data, id: data.id }); // put server row

          // replace references in other local tables and pending queue
          // replace all occurrences of payload.id in pending_sync.payload
          const pending = await db.pending_sync.toArray();
          for (const p of pending) {
            const str = JSON.stringify(p.payload);
            if (str.includes(payload.id)) {
              const newPayload = JSON.parse(str.replace(new RegExp(payload.id, "g"), data.id));
              await db.pending_sync.put({ ...p, payload: newPayload });
            }
          }
        }

        // done: remove item from pending
        await db.pending_sync.delete(item.local_id!);
      }

      if (item.action === "update") {
        // console.log("made it here")
        const table = item.table;
        const payload = item.payload;
        const { error } = await supabase.from(table).update(payload).eq("id", payload.id);

        if (error) throw error;
        await db.pending_sync.delete(item.local_id!);
      }

      if (item.action === "soft_delete") {
        // perform soft delete on server (set soft_deleted true and deleted_at, deleted_reason)
        const table = item.table;
        const { id, reason } = item.payload;
        const { error } = await supabase.from(table).update({ soft_deleted: true, deleted_reason: reason, deleted_at: new Date().toISOString() }).eq("id", id);
        if (error) throw error;
        await db.pending_sync.delete(item.local_id!);
      }

      // other actions: hard_delete etc. (implement if needed)
    } catch (err: any) {
      // record error, increment tries
      await db.pending_sync.update(item.local_id!, {
        tries: (item.tries ?? 0) + 1,
        last_error: err?.message ?? String(err),
      });
      // if tries exceeded, leave it for manual review
      if ((item.tries ?? 0) + 1 >= MAX_RETRIES) {
        console.error("Max retries reached for", item, err);
      }
      throw err;
    }
  }

  async function syncPending() {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    const items = await db.pending_sync.orderBy("created_at").toArray();
    for (const item of items) {
      if (abortRef.current) break;
      try {
        await processItem(item);
      } catch (e) {
        // exponential backoff on error
        await new Promise((res) => setTimeout(res, 1000 * Math.min(30, (item.tries ?? 0) ** 2)));
      }
    }
    setIsSyncing(false);
  }

  useEffect(() => {
    const onOnline = () => void syncPending();
    window.addEventListener("online", onOnline);
    // try initial sync if online on mount
    if (navigator.onLine) syncPending();
    return () => {
      window.removeEventListener("online", onOnline);
      abortRef.current = true;
    };
  }, []);

  return {
    isSyncing,
    manualSync: syncPending,
  };
}
