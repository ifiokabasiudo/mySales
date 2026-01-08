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
import { db } from "../db";

export async function safeDB<T>(fn: () => Promise<T>, tableName?: keyof typeof db) {
  try {
    // Optionally check if table exists
    if (tableName && !(tableName in db)) {
      console.warn(`Table ${tableName} does not exist yet`);
      return [] as any;
    }

    return await fn();
  } catch (err: any) {
    if (err.name === "UnknownError" || err.name === "DatabaseClosedError") {
      console.warn("Dexie table missing or DB not ready:", err.message);
      return [] as any; // just return empty array if table doesn't exist
    }
    throw err;
  }
}
