"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/app/dashboard/addSale/components/searchBar";
import { offlineInsert } from "@/lib/offline";
import { getSession } from "@/lib/session";
import useOfflineSync from "@/hooks/useOfflineSync";
import { BatchItems } from "@/app/inventory/constants/batch_items";

type ReconciliationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sale: {
    id: string;
    total_amount: number;
    status: "pending" | "partial" | "completed";
    note: string | null;
    reconciled_amount: number;
    soft_deleted: boolean | undefined;
  } | null;
};

type Batch = {
  id: string;
  item_id: string;
  unit_cost: number;
  quantity: number;
  soft_deleted: boolean | undefined;
};

export default function ReconciliationModal({
  isOpen,
  onClose,
  sale,
}: ReconciliationModalProps) {
  const [amount, setAmount] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [searchId, setSearchId] = useState("");
  const [quantity, setQuantity] = useState("");
  // const [paymentType, setPaymentType] = useState("Cash");
  const [batch, setBatch] = useState<Batch | null>(null);
  const options = ["Cash", "POS", "Transfer"];
  
  const { manualSync } = useOfflineSync();

  const items = BatchItems();

  useEffect(() => {
      const batch = items.filter((item) => item.item_id == searchId && item.is_active)
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      }
    );
      setBatch(batch[0]);
    }, [searchValue]);

  if (!isOpen || !sale) return null;

  const remaining = sale.total_amount - (sale.reconciled_amount ?? 0);

  const price = Number(amount) || 0;
  const qty = Number(quantity) || 0;

  const calculatedTotal = price * qty;

  const handleSubmit = async () => {
    const data = await getSession();

    console.log("Session data:", data);

    if (!data?.profile.phone) {
      alert("User not authenticated!");
      return;
    }

    const value = price;
    const tQuantity = qty;
    if (value <= 0) return alert("Enter a valid amount");
    if (tQuantity <= 0) return alert("Enter a quantity");
    if (calculatedTotal > remaining)
      return alert("Amount exceeds remaining balance");
    if(batch?.quantity && tQuantity > batch?.quantity) return alert("Quantity is more than batch")

    const inventorySaleId = crypto.randomUUID();

    // 1️⃣ CREATE INVENTORY SALE (this deducts stock)
    const inventorySale = await offlineInsert("inventory_sales", {
      id: inventorySaleId,
      phone: data.profile.phone,
      name: searchValue,
      item_id: searchId,
      quantity: tQuantity,
      selling_price: value,
      total_amount: tQuantity * value,
      // payment_type: paymentType,
    });

    if (!inventorySale) {
      alert("Failed to record inventory sale");
      return;
    }

    const linkedAmount = inventorySale.total_amount;

    // 🔥 This is where reconciliation insert/update will happen
    await offlineInsert("reconciliation_links", {
      id: crypto.randomUUID(), // needed so Dexie + Supabase share same ID
      phone: data.profile.phone,
      quick_sales_id: sale.id,
      inventory_sales_id: inventorySaleId,
      linked_amount: linkedAmount,
      //   quantity: tQuantity,
      //   created_at: formatDate(new Date()),
    });

    await manualSync();

    alert("Item was saved offline, would sync when online!")

    setAmount("");
    setQuantity("");
    setSearchId("");
    setSearchValue("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* modal */}
      <div className="relative bg-white w-full max-w-sm rounded-xl p-5 z-10">
        <h2 className="text-xl font-bold mb-3">Reconcile Sale</h2>

        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Total:</strong> ₦{sale.total_amount}
          </p>
          <p>
            <strong>Already assigned:</strong> ₦{sale.reconciled_amount ?? 0}
          </p>
          <p className="text-green-700 font-semibold">
            Remaining: ₦{remaining}
          </p>
        </div>
        {batch && <div className="flex justify-between text-sm text-gray-400 mt-2">
          <h1>Batch Details</h1>
            <span>Cost Price: {batch.unit_cost}</span>
            <span>•</span>
            <span>Remaining: {batch.quantity - Number(quantity)}</span>
            </div>}

        <div className="mt-4">
          <SearchBar
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            searchId={searchId}
            setSearchId={setSearchId}
          />
          {price > 0 && qty > 0 && (
            <div className="mt-2 text-sm font-semibold text-green-700">
              Total: ₦{calculatedTotal.toLocaleString()}
            </div>
          )}
          <label className="text-sm text-gray-500 block mb-1">
            Price per item (₦)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="e.g. 3000"
          />
          <label className="text-sm text-gray-500 block mb-1">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="e.g. 1"
          />
          {/* <div>
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
          </div> */}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2 hover:cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-[#1C8220] text-white rounded-lg py-2 hover:cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
