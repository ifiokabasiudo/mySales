// lib/sync/syncPending.ts
// "use client";

import { db } from "../db";
import { supabase } from "../supabase/client";
import { classifySyncError } from "./classifySyncError";
import { safeDB } from "./safeDB";

const MAX_RETRIES = 5;

type AbortSignalLike = {
  aborted: boolean;
};

export async function syncPending({
  signal,
  force = false,
}: {
  signal?: AbortSignalLike;
  force?: boolean;
} = {}) {
  // Always process in order
  //   const items = await db.pending_sync.orderBy("created_at").toArray();
  // const items = await safeDB(() => db.pending_sync.orderBy("created_at").toArray());
  const items = await safeDB(
    async () =>
      db.pending_sync ? db.pending_sync.orderBy("created_at").toArray() : [],
    "pending_sync"
  );

  for (const item of items) {
    if (signal?.aborted) break;
    if (item.permanently_failed) continue;

    if (!force && item.paused_until && Date.now() < item.paused_until) {
      continue;
    }

    try {
      const { table, action, payload } = item;

      /* ===========================
         INSERT
      ============================ */
      if (action === "insert") {
        const { data, error } = await supabase
          .from(table)
          .insert(payload)
          .select()
          .single();

        if (error) throw new Error(error.message);

        // 🔁 ID REMAPPING (critical for offline-first)
        if (data?.id && data.id !== payload.id) {
          // Replace local row
          await db.table(table).delete(payload.id);
          await db.table(table).put({ ...data, id: data.id });

          // Update all pending payload references
          const pending = await db.pending_sync.toArray();
          for (const p of pending) {
            const raw = JSON.stringify(p.payload);
            if (raw.includes(payload.id)) {
              const updatedPayload = JSON.parse(
                raw.replace(new RegExp(payload.id, "g"), data.id)
              );
              await db.pending_sync.put({
                ...p,
                payload: updatedPayload,
              });
            }
          }
        }

        await db.pending_sync.delete(item.local_id!);
        continue;
      }

      /* ===========================
         UPDATE
      ============================ */
      if (action === "update") {
        const { error } = await supabase
          .from(table)
          .update(payload)
          .eq("id", payload.id);

        if (error) throw new Error(error.message);

        await db.pending_sync.delete(item.local_id!);
        continue;
      }

      /* ===========================
         SOFT DELETE
      ============================ */
      if (action === "soft_delete") {
        const { id, reason } = payload;

        const { error } = await supabase
          .from(table)
          .update({
            soft_deleted: true,
            deleted_reason: reason,
            deleted_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw new Error(error.message);

        await db.pending_sync.delete(item.local_id!);
        continue;
      }

      /* ===========================
         UNKNOWN ACTION
      ============================ */
      console.warn("Unknown sync action:", action, item);
      await db.pending_sync.delete(item.local_id!);
    } catch (err: any) {
      const classification = classifySyncError(err);

      if (classification.type === "permanent") {
        await db.pending_sync.update(item.local_id!, {
          permanently_failed: true,
          last_error: classification.reason,
        });
        continue;
      }

      // transient error → retry
      await db.pending_sync.update(item.local_id!, {
        tries: (item.tries ?? 0) + 1,
        last_error: err.message,
        paused_until:
          (item.tries ?? 0) + 1 >= 3
            ? Date.now() + 10 * 60 * 1000 // 5 minutes
            : null,
      });

      if ((item.tries ?? 0) + 1 >= MAX_RETRIES) {
        console.error(
          "Max retries reached for sync item: ",
          item,
          " currently at ",
          item.tries,
          " tries."
        );
      }

      continue;

      // 🧯 Safe failure handling (no infinite loops)
      //   const nextTries = (item.tries ?? 0) + 1;

      //   await db.pending_sync.update(item.local_id!, {
      //     tries: nextTries,
      //     last_error: err?.message ?? String(err),
      //   });

      //   if (nextTries >= MAX_RETRIES) {
      //     console.error("⛔ Max retries reached for sync item:", item);
      //   }

      //   // ❗ Do NOT throw — move to next item
      //   continue;
    }
  }
}

// // lib/sync/syncPending.ts
// import { db, PendingSync } from "../db";
// import { supabase } from "../supabase/client";

// const MAX_RETRIES = 5;

// export async function syncPending({
//   signal,
// }: {
//   signal?: { aborted: boolean };
// } = {}) {
//   const items = await db.pending_sync.orderBy("created_at").toArray();

//   for (const item of items) {
//     if (signal?.aborted) break;
//     if ((item.tries ?? 0) >= MAX_RETRIES) continue;

//     try {
//       // 🔁 move processItem logic here (unchanged)
//       // insert / update / soft_delete
//       if (item.action === "insert") {
//         // console.log("It made it here")
//         // Insert to supabase
//         const table = item.table;
//         const payload = item.payload;

//         // 🔴 SPECIAL CASE: inventory_sales
//         // if (table === "inventory_sales") {
//         //   const clientSaleId = crypto.randomUUID();

//         //   const { error } = await supabase.rpc("create_inventory_sale", {
//         //     p_client_sale_id: clientSaleId,
//         //     p_item_id: payload.item_id,
//         //     p_name: payload.name,
//         //     p_quantity: payload.quantity,
//         //     p_selling_price: payload.selling_price,
//         //     p_phone: payload.phone,
//         //     p_payment_type: payload.payment_type
//         //     // p_auth_user_id: payload.auth_user_id,
//         //   });

//         //   if (error) throw error;

//         //   // sale already exists locally → server created its own row
//         //   // local row will be reconciled later if you want
//         //   await db.pending_sync.delete(item.local_id!);
//         //   return;
//         // }

//         // mapping logic: if payload has local id and server will return an id, we need link update
//         const { data, error } = await supabase
//           .from(table)
//           .insert(payload)
//           .select()
//           .single();

//         if (error) throw error;

//         // If server returned new id different from local, update local DB rows and any queued rows that reference it
//         if (data && data.id && data.id !== payload.id) {
//           // update local row to server id
//           await db.table(table).delete(payload.id); // remove local row keyed by local id
//           await db.table(table).put({ ...data, id: data.id }); // put server row

//           // replace references in other local tables and pending queue
//           // replace all occurrences of payload.id in pending_sync.payload
//           const pending = await db.pending_sync.toArray();
//           for (const p of pending) {
//             const str = JSON.stringify(p.payload);
//             if (str.includes(payload.id)) {
//               const newPayload = JSON.parse(
//                 str.replace(new RegExp(payload.id, "g"), data.id)
//               );
//               await db.pending_sync.put({ ...p, payload: newPayload });
//             }
//           }
//         }

//         // done: remove item from pending
//         await db.pending_sync.delete(item.local_id!);
//       }

//       if (item.action === "update") {
//         // console.log("made it here")
//         const table = item.table;
//         const payload = item.payload;
//         const { error } = await supabase
//           .from(table)
//           .update(payload)
//           .eq("id", payload.id);

//         if (error) throw error;
//         await db.pending_sync.delete(item.local_id!);
//       }

//       if (item.action === "soft_delete") {
//         // perform soft delete on server (set soft_deleted true and deleted_at, deleted_reason)
//         const table = item.table;
//         const { id, reason } = item.payload;
//         const { error } = await supabase
//           .from(table)
//           .update({
//             soft_deleted: true,
//             deleted_reason: reason,
//             deleted_at: new Date().toISOString(),
//           })
//           .eq("id", id);
//         if (error) throw error;
//         await db.pending_sync.delete(item.local_id!);
//       }
//     } catch (err: any) {
//       // record error, increment tries
//       await db.pending_sync.update(item.local_id!, {
//         tries: (item.tries ?? 0) + 1,
//         last_error: err?.message ?? String(err),
//       });
//       // if tries exceeded, leave it for manual review
//       if ((item.tries ?? 0) + 1 >= MAX_RETRIES) {
//         console.error("Max retries reached for", item, err);
//       }
//       throw err;
//       //   // retries already handled inside
//       //   await new Promise((r) =>
//       //     setTimeout(r, 1000 * Math.min(30, (item.tries ?? 0) ** 2))
//       //   );
//     }
//   }
// }
