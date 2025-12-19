"use client";
import { useEffect, useState } from "react";
import { db } from "../lib/db";

export default function useInventoryItems() {
  const [items, setItems] = useState<any[]>([]);

  const fetchLocalItems = async () => {
    const allItems = await db.inventory_items.toArray();
    setItems(allItems);
  };

  useEffect(() => {
    fetchLocalItems();

    // Define the hook functions
    const onCreate = () => fetchLocalItems();
    const onUpdate = () => fetchLocalItems();
    const onDelete = () => fetchLocalItems();

    // Subscribe to Dexie hooks
    db.inventory_items.hook.creating.subscribe(onCreate);
    db.inventory_items.hook.updating.subscribe(onUpdate);
    db.inventory_items.hook.deleting.subscribe(onDelete);

    return () => {
      // Unsubscribe properly by passing the same function
      db.inventory_items.hook.creating.unsubscribe(onCreate);
      db.inventory_items.hook.updating.unsubscribe(onUpdate);
      db.inventory_items.hook.deleting.unsubscribe(onDelete);
    };
  }, []);

  return items;
}
