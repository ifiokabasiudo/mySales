// import { db } from "../db";

// export async function safeDB<T>(fn: () => Promise<T>) {
//   if (!db.isOpen()) {
//     try {
//       await db.open();
//     } catch (err: any) {
//       if (err.name === "UnknownError") {
//         console.warn("Dexie workaround: retrying DB open");
//         await new Promise((r) => setTimeout(r, 500));
//         await db.open();
//       } else {
//         throw err;
//       }
//     }
//   }
//   return fn();
// }

// lib/sync/safeDB.ts
// import { db } from "../db";

// export async function safeDB<T>(fn: () => Promise<T>, tableName?: keyof typeof db) {
//   try {
//     // Optionally check if table exists
//     if (tableName && !(tableName in db)) {
//       console.warn(`Table ${tableName} does not exist yet`);
//       return [] as any;
//     }

//     return await fn();
//   } catch (err: any) {
//     if (err.name === "UnknownError" || err.name === "DatabaseClosedError") {
//       console.warn("Dexie table missing or DB not ready:", err.message);
//       return [] as any; // just return empty array if table doesn't exist
//     }
//     throw err;
//   }
// }

// lib/sync/safeDB.ts
import { db } from "../db";

const DB_NAME = "mySalesDB";
const RESET_FLAG = "__db_reset_attempted__";

function isFatalIndexedDBError(err: any) {
  return (
    err?.name === "UnknownError" ||
    err?.name === "DatabaseClosedError" ||
    err?.message?.includes("opening backing store") ||
    err?.message?.includes("IndexedDB")
  );
}

async function resetDatabaseOnce() {
  if (typeof window === "undefined") return;

  if (sessionStorage.getItem(RESET_FLAG)) {
    console.error("DB reset already attempted, giving up");
    return;
  }

  sessionStorage.setItem(RESET_FLAG, "true");

  console.warn("⚠️ IndexedDB corrupted. Deleting DB and reloading…");

  try {
    indexedDB.deleteDatabase(DB_NAME);
  } catch (e) {
    console.error("Failed to delete IndexedDB", e);
  }

  // Small delay to let deletion flush
  setTimeout(() => {
    window.location.reload();
  }, 300);
}

export async function safeDB<T>(
  fn: () => Promise<T>,
  tableName?: keyof typeof db
): Promise<T> {
  try {
    // Optional table guard
    if (tableName && !(tableName in db)) {
      console.warn(`Table ${String(tableName)} does not exist yet`);
      return [] as any;
    }

    return await fn();
  } catch (err: any) {
    if (isFatalIndexedDBError(err)) {
      console.error("Fatal IndexedDB error detected:", err);
      await resetDatabaseOnce();
      return [] as any;
    }

    throw err;
  }
}

