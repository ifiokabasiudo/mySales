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
import { QuickSales } from "../quickSalesColumns";
import { offlineUpdate } from "@/lib/offline";
import { getSession } from "@/lib/session";
import useOfflineSync from "@/hooks/useOfflineSync";
import { db } from "@/lib/db";
import { useSafeAction } from "@/hooks/useSafeAction";

export default function EditModal({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: QuickSales;
}) {
  const [amount, setAmount] = useState(String(data.total_amount));
  const [note, setNote] = useState(data.note);
  const [paymentType, setPaymentType] = useState("Cash");
  const options = ["Cash", "POS", "Transfer"];
  const { manualSync } = useOfflineSync();
  const { run, isLoading } = useSafeAction();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    await run(
      async () => {
        const tAmount = parseFloat(amount || "0");
        if (tAmount <= 0) throw new Error ("Enter a valid amount");

        const sessionData = await getSession();

        console.log("Session data:", sessionData);

        if (!sessionData?.profile.phone) {
          throw new Error ("User not authenticated!");
        }

        await offlineUpdate("quick_sales", {
          id: data.id,
          total_amount: amount,
          reconciled_amount: 0,
          note: note,
          mode: paymentType,
          status: "pending",
        });

        console.log(
          "Pending sync after update:",
          await db.pending_sync.toArray()
        );

        // Now trigger sync
        await manualSync();

        // alert("Item was saved offline, would sync when online!");
        setAmount("0");
        setOpen(false);
      },
      { loading: "Editing...", success: "Updated sucessfully" }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
        </DialogHeader>
        <div>
          <label>Amount</label>
          <Input
            disabled={isLoading}
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

        <div className="space-y-4">
          <div>
            <label>Note (optional)</label>
            <Input
              disabled={isLoading}
              value={note || ""}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add note"
            />
          </div>

          <Button
            disabled={isLoading}
            className={`w-full bg-gray-600 text-white hover:cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
            onClick={handleSave}
          >
            {isLoading ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
