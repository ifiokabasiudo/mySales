// import { db } from "../db";
// // import { Preferences } from "@capacitor/preferences";

// export async function clearLocalDataForNewUser(userId: string) {
//   console.log("Clearing local state for new user...");

//   for (const key of Object.keys(db) as (keyof typeof db)[]) {
//     // skip pending_sync
//     if (key === "pending_sync") continue;

//     const table = db[key];
//     // only clear if this is a Dexie Table
//     if (table && typeof (table as any).clear === "function") {
//       await (table as any).clear();
//     }
//   }
// }

// import { db } from "../db";

// export async function clearLocalDataForNewUser(phone: string) {
//   console.log("Clearing local state for new user...");

//   for (const key of Object.keys(db) as (keyof typeof db)[]) {
//     // 1️⃣ Skip pending_sync
//     if (key === "pending_sync") continue;

//     const table = db[key];
//     // 2️⃣ Only act on Dexie tables
//     if (table && typeof (table as any).clear === "function") {
//       try {
//         // 3️⃣ Optional per-user filtering: remove rows NOT belonging to the new user
//         const hasPhoneIndex = "where" in table; // rough check for Dexie table
//         if (hasPhoneIndex) {
//           // @ts-ignore
//           await table.where("phone").notEqual(phone).delete();
//         } else {
//           // fallback: clear everything if no phone field
//           await (table as any).clear();
//         }
//       } catch (err) {
//         console.warn(`Failed to clear table ${key}:`, err);
//       }
//     }
//   }

//   console.log("Local data cleared for new user:", phone);
// }

import { db } from "../db";
import Dexie from "dexie";

// Type guard: checks if something is a Dexie Table
function isDexieTable(obj: any): obj is Dexie.Table<any, any> {
  return obj && typeof obj.where === "function" && typeof obj.clear === "function";
}

export async function clearLocalData(phone: string) {
  console.log("Clearing local state for new user...");

  for (const key of Object.keys(db) as (keyof typeof db)[]) {
    // Skip pending_sync
    if (key === "pending_sync") continue;

    const table = db[key];

    if (isDexieTable(table)) {
      try {
        // Optional per-user filtering
        // Delete rows that do NOT belong to the current user's phone
        // If table doesn't have a phone column, this will throw, so fallback to clear
        try {
          await table.where("phone").notEqual(phone).delete();
        } catch {
          // fallback: clear whole table if no phone column
          await table.clear();
        }
      } catch (err) {
        console.warn(`Failed to clear table ${key}:`, err);
      }
    }
  }

  console.log("Local data cleared for new user:", phone);
}

