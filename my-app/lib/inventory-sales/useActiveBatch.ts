"use client";

import { useMemo } from "react";
import { InventoryBatch } from "@/lib/db";
import { selectActiveBatchForItem } from "@/lib/inventory-sales/batchSelector";

export function useActiveBatch(
  batches: InventoryBatch[],
  itemId: string
) {
  return useMemo(() => {
    if (!itemId) return null;
    return selectActiveBatchForItem(batches, itemId);
  }, [batches, itemId]);
}
