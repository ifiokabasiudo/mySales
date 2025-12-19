import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../../lib/db";


export function InventoryItems() {
  const items = useLiveQuery(() => db.inventory_items.toArray(), []) ?? [];

  const dataForTable = items.map(item => ({
    id: item.id,
    name: item.name,
    soft_deleted: item.soft_deleted,
  }));

  const finalData = dataForTable.filter(row => !row.soft_deleted);

  console.log("These are the inventory items: ", finalData)

  return finalData
}

