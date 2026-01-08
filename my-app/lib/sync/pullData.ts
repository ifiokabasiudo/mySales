// import { db } from "../../lib/db";
// import { supabase } from "../supabase/client";
// import { getSession } from "../session";

// export async function pullData() {

//  const tables = ["inventory_items", "quick_sales", "inventory_sales", "inventory_batches", "reconciliation_links", "expenses"];
//   const session = await getSession();
//   if (!session) throw new Error("No session found");
//   const phone = session?.profile.phone!;

//   for ( const table of tables) {
//   const { data: items, error } = await supabase
//     .from(table)
//     .select("*")
//     .eq("phone", phone)

//   if (error) throw error;

//   await db.inventory_items.clear();
//   await db.inventory_items.bulkPut(items);
// }
// }
import { supabase } from "../supabase/client";
import { getSession } from "../session";
import { tableMap } from "./tableMap";
import { Table } from "dexie";
import { safeDB } from "./safeDB";

async function replaceTable<T>(table: Table<T, any>, items: T[]) {
  await safeDB(async () => {
    await table.clear();
    await table.bulkPut(items);
  });
}

export async function pullData() {
  const tables = Object.keys(tableMap) as (keyof typeof tableMap)[];

  const session = await getSession();
  if (!session) throw new Error("No session found");

  const phone = session.profile.phone;

  for (const table of tables) {
    const localTable = tableMap[table];

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("phone", phone);

    if (error) throw error;

    console.log("Ok so this ran!!!");

    // 🔒 atomic replace
    await replaceTable(localTable, data ?? []);
  }
}
