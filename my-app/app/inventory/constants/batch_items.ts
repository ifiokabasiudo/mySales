import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../lib/db";


export function BatchItems() {
  const items = useLiveQuery(() => db.inventory_batches.toArray(), []) ?? [];

  const dataForTable = items.map(item => ({
    id: item.id,
    item_id: item.item_id,
    unit_cost: item.unit_cost,
    is_active: item.is_active,
    quantity: item.quantity,
    created_at: item.created_at,
    soft_deleted: item.soft_deleted,
  }));

  const finalData = dataForTable.filter(row => !row.soft_deleted);

  console.log("These are the batch items: ", finalData)

  return finalData
}