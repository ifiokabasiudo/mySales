// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { InventoryItems } from "../InventoryItemsColumns";
//
// import useOfflineSync from "@/hooks/useOfflineSync";

// export default function DeleteModal({
//   open,
//   setOpen,
//   data,
// }: {
//   open: boolean;
//   setOpen: React.Dispatch<React.SetStateAction<boolean>>;
//   data: InventoryItems;
// }) {
//   const { manualSync } = useOfflineSync();

//   async function handleDelete() {
//     console.log("Deleted ID:", data.id);

//     await offlineSoftDelete("inventory_items", data.id, "User deleted");
//     // await manualSync();
//     await new Promise((res) => setTimeout(res, 0));

//     await manualSync();
//     // setTimeout(() => {
//     // }, 50);

//     setOpen(false);
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>

//     </Dialog>
//   );
// }

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import { InventoryItems } from "../InventoryItemsColumns";
import { offlineSoftDelete } from "@/lib/offline";
import useOfflineSync from "@/hooks/useOfflineSync";
import { db } from "@/lib/db";
import { BatchItems } from "@/app/inventory/constants/batch_items";
import { useSafeAction } from "@/hooks/useSafeAction";

export default function EditModal({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: InventoryItems;
}) {
  const [mode, setMode] = useState<"batch" | "delete">("batch");
  const [batchId, setBatchId] = useState<string>("");

  const { manualSync } = useOfflineSync();

  const { run, isLoading } = useSafeAction();

  const batches = BatchItems().filter((b) => b.item_id === data.id);
  // const activeBatch = batches.find((b) => b.id === batchId);

  async function handleDelete() {
    await run(
      async () => {
        if (!batchId) {
          throw new Error ("No batch selected");
        }

        await offlineSoftDelete(
          "inventory_batches",
          batchId,
          "User deleted batch"
        );

        await manualSync();

        setOpen(false);
      },
      { loading: "Deleting...", success: "Successfully deleted" }
    );
  }

  const resetAndClose = () => {
    setMode("batch");
    setBatchId("");
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetAndClose();
      }}
    >
      {mode === "batch" ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Batch of {data.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {batches.map((b) => (
              <div
                key={b.id}
                className="flex justify-between items-center bg-gray-200 p-3 rounded"
              >
                <div>
                  <p>Qty: {b.quantity}</p>
                  <p>Cost: {b.unit_cost}</p>
                </div>

                <Button
                  disabled={isLoading}
                  variant="destructive"
                  className={`bg-rose-600 hover:cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
                  onClick={() => {
                    setBatchId(b.id);
                    setMode("delete");
                  }}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this batch of{" "}
            <span className="font-semibold">{data.name}</span>? This action
            cannot be undone.
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              disabled={isLoading}
              variant="outline"
              className="hover:cursor-pointer"
              onClick={() => {
                setMode("batch");
                setBatchId("");
              }}
            >
              Back
            </Button>

            <Button 
              disabled={isLoading}
              variant="destructive"
              className={`bg-rose-600 hover:cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
