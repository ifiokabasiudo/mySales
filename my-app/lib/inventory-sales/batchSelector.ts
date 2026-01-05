import { InventoryBatch } from "@/lib/db";

export function selectActiveBatchForItem(
  batches: InventoryBatch[],
  itemId: string
): InventoryBatch | null {
  return (
    batches
      .filter(
        (b) =>
          b.item_id === itemId &&
          b.is_active &&
          !b.soft_deleted
      )
      // FIFO — oldest batch first
      .sort((a, b) =>
        (a.created_at ?? "").localeCompare(b.created_at ?? "")
      )[0] ?? null
  );
}
