"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { InventoryItems } from "../InventoryItemsColumns";
import { offlineUpdate } from "@/lib/offline";
import { getSession } from "@/lib/session";
import useOfflineSync from "@/hooks/useOfflineSync";
import { db } from "@/lib/db";
import Dexie from "dexie";

export default function EditModal({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: InventoryItems;
}) {
  const [name, setName] = useState(data.name);
  const [stockQuantity, setStockQuantity] = useState(
    String(data.stock_quantity)
  );
  const [unitPrice, setUnitPrice] = useState(String(data.unit_price));
  const { manualSync } = useOfflineSync();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(unitPrice || "0");
    const quantity = parseFloat(stockQuantity || "0");

    if (!name.trim()) return alert("Name is required");
    if (quantity < 0) return alert("Stock quantity cannot be negative");
    if (price < 0) return alert("Unit price cannot be negative");

    // // onAdd({ name, stock_quantity: quantity, unit_price: price, });
    // console.log({name, stock_quantity: quantity, unit_price: price})

    const sessionData = await getSession();

    console.log("Session data:", sessionData);

    if (!sessionData?.profile.phone) {
      alert("User not authenticated!");
      return;
    }

    function formatDate(date: Date) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }

    await offlineUpdate("inventory_items", {
      id: data.id,
      // phone: sessionData.profile.phone,
      name: name,
      unit_price: price,
      stock_quantity: quantity,
      updated_at: formatDate(new Date()),
    });

    console.log("Pending sync after update:", await db.pending_sync.toArray());

    // Now trigger sync
    await manualSync();

    // await manualSync();
    //  await manualSync();

    alert("Item was saved offline, would sync when online!");

    // reset form
    setName("");
    setStockQuantity("0");
    setUnitPrice("0");

    setOpen(false);
    // setTimeout(() => {
    // manualSync();
    // }, 50);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label>Item Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item Name"
            />
          </div>

          <div>
            <label>Quantity</label>
            <Input
              type="number"
              value={stockQuantity}
              onChange={(e) => {
                const v = e.target.value;

                // allow empty, digits, and decimals
                if (/^[0-9]*\.?[0-9]*$/.test(v)) {
                  setStockQuantity(v);
                }
              }}
              placeholder="Quantity"
            />
          </div>

          <div>
            <label>Unit Price</label>
            <Input
              type="number"
              value={unitPrice}
              onChange={(e) => {
                const v = e.target.value;

                // allow empty, digits, and decimals
                if (/^[0-9]*\.?[0-9]*$/.test(v)) {
                  setUnitPrice(v);
                }
              }}
              placeholder="Unit Price"
            />
          </div>

          <Button
            className="w-full bg-gray-600 text-white hover:cursor-pointer"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
