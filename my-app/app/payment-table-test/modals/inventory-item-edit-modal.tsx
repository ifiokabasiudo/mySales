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
import { offlineUpdate } from "@/lib/offline";
import useOfflineSync from "@/hooks/useOfflineSync";
import { db } from "@/lib/db";
import { BatchItems } from "@/app/inventory/constants/batch_items";

export default function EditModal({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: InventoryItems;
}) {
  const [mode, setMode] = useState<"batch" | "edit">("batch");
  const [batchId, setBatchId] = useState<string>("");

  const [batchQuantity, setBatchQuantity] = useState("");
  const [batchUnitCost, setBatchUnitCost] = useState("");

  const { manualSync } = useOfflineSync();

  const batches = BatchItems().filter((b) => b.item_id === data.id);
  const activeBatch = batches.find((b) => b.id === batchId);

  /** Load batch values into form */
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (activeBatch && !hydratedRef.current) {
      setBatchQuantity(String(activeBatch.quantity));
      setBatchUnitCost(String(activeBatch.unit_cost));
      hydratedRef.current = true;
    }
  }, [activeBatch]);

  const handleSave = async () => {
    if (!batchId) {
      alert("No batch selected");
      return;
    }

    const quantity = Number(batchQuantity);
    const unitCost = Number(batchUnitCost);

    if (quantity < 0 || unitCost < 0) {
      alert("Values cannot be negative");
      return;
    }

    await offlineUpdate("inventory_batches", {
      id: batchId,
      item_id: data.id,
      quantity,
      unit_cost: unitCost,
      updated_at: new Date().toISOString(),
    });

    console.log("Pending sync:", await db.pending_sync.toArray());

    await manualSync();

    resetAndClose();
  };

  const resetAndClose = () => {
    hydratedRef.current = false;
    setMode("batch");
    setBatchId("");
    setBatchQuantity("");
    setBatchUnitCost("");
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
                  className="bg-gray-600 text-white hover:cursor-pointer"
                  onClick={() => {
                    setBatchId(b.id);
                    setMode("edit");
                  }}
                >
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label>Quantity</label>
              <Input
                type="number"
                value={batchQuantity}
                onChange={(e) => setBatchQuantity(e.target.value)}
              />
            </div>

            <div>
              <label>Unit Cost</label>
              <Input
                type="number"
                value={batchUnitCost}
                onChange={(e) => setBatchUnitCost(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <span
                className="cursor-pointer"
                onClick={() => {
                  hydratedRef.current = false;
                  setMode("batch");
                  setBatchId("");
                }}
              >
                Back
              </span>

              <Button
                className="bg-gray-600 text-white hover:cursor-pointer"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
