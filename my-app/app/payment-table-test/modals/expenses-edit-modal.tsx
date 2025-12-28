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
import { Expenses } from "../expensesColumns";
import { offlineUpdate } from "@/lib/offline";
import { getSession } from "@/lib/session";
import useOfflineSync from "@/hooks/useOfflineSync";
import { db } from "@/lib/db";

export default function EditModal({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: Expenses;
}) {
  const [category, setCategory] = useState(data.category);
  const [amount, setAmount] = useState(String(data.amount));

  const { manualSync } = useOfflineSync();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const tAmount = parseFloat(amount || "0");

    if (!category.trim()) return alert("Category is required");
    if (tAmount < 0) return alert("Amount cannot be negative");

    const sessionData = await getSession();

    console.log("Session data:", sessionData);

    if (!sessionData?.profile.phone) {
      alert("User not authenticated!");
      return;
    }

    await offlineUpdate("expenses", {
      id: data.id,
      category: category,
      amount: tAmount,
    });

    console.log("Pending sync after update:", await db.pending_sync.toArray());

    await manualSync();

    alert("Item was saved offline, would sync when online!");

    setCategory("");
    setAmount("0");

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label>Category</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
            />
          </div>

          <div>
            <label>Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => {
                const v = e.target.value;

                // allow empty, digits, and decimals
                if (/^[0-9]*\.?[0-9]*$/.test(v)) {
                  setAmount(v);
                }
              }}
              placeholder="Amount"
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
