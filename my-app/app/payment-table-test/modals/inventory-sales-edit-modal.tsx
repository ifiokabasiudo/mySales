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
import { InventorySales } from "../inventorySalesColumns";
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
  data: InventorySales;
}) {
  const [name, setName] = useState(data.name);
  const [quantity, setquantity] = useState(
    String(data.quantity)
  );
  const [sellingPrice, setSellingPrice] = useState(String(data.selling_price));
  const [paymentType, setPaymentType] = useState("Cash");
  const options = ["Cash", "POS", "Transfer"];
  const { manualSync } = useOfflineSync();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(sellingPrice || "0");
    const tQuantity = parseFloat(quantity || "0");

    if (!name.trim()) return alert("Name is required");
    if (tQuantity < 0) return alert("Quantity cannot be negative");
    if (price < 0) return alert("Selling price cannot be negative");

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

    await offlineUpdate("inventory_sales", {
      id: data.id,
      // phone: sessionData.profile.phone,
      item_id: data.item_id,
      name: name,
      quantity: tQuantity,
      selling_price: price,
      payment_type: paymentType,
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
    setquantity("0");
    setSellingPrice("0");

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
              value={quantity}
              onChange={(e) => {
                const v = e.target.value;

                // allow empty, digits, and decimals
                if (/^[0-9]*\.?[0-9]*$/.test(v)) {
                  setquantity(v);
                }
              }}
              placeholder="Quantity"
            />
          </div>

          <div>
            <label>Selling Price</label>
            <Input
              type="number"
              value={sellingPrice}
              onChange={(e) => {
                const v = e.target.value;

                // allow empty, digits, and decimals
                if (/^[0-9]*\.?[0-9]*$/.test(v)) {
                  setSellingPrice(v);
                }
              }}
              placeholder="Unit Price"
            />
          </div>

          <div>
              <p className="text-sm mb-1 text-slate-500">Payment Type</p>
              {options.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-4 cursor-pointer w-fit"
                  onClick={() => setPaymentType(item)}
                >
                  <div className="flex gap-3 items-center">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center
            ${
              paymentType === item
                ? "border-[#1C8220] bg-[#1C8220]"
                : "border-black"
            }
          `}
                    >
                      {paymentType === item && (
                        <div className="w-2 h-2 bg-white rounded" />
                      )}
                    </div>

                    <span className="text-lg text-black">{item}</span>
                  </div>
                </label>
              ))}
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
