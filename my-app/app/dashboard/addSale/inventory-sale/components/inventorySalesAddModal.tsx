"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "../../components/searchBar";
import { BatchItems } from "@/app/inventory/constants/batch_items";
import { useActiveBatch } from "@/lib/inventory-sales/useActiveBatch";

type AddItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    id: string;
    name: string;
    selling_price: number;
    payment_type: string;
    quantity: number;
  }) => void;
};

// type Batch = {
//   id: string;
//   item_id: string;
//   unit_cost: number;
//   quantity: number;
//   soft_deleted: boolean | undefined;
// };

const InventorySalesAddModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  // const [note, setNote] = useState("");
  const [amount, setAmount] = useState("0");
  const [paymentType, setPaymentType] = useState("Cash");
  const [searchValue, setSearchValue] = useState("");
  const [searchId, setSearchId] = useState("");
  const [quantity, setQuantity] = useState("1");
  // const [batch, setBatch] = useState<Batch | null>(null);
  const options = ["Cash", "POS", "Transfer"];

  const items = BatchItems();
  const batch = useActiveBatch(items, searchId);

  console.log("The batch in the inventory sales", batch);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tAmount = parseFloat(amount || "0");
    if (tAmount < 0) return alert("Amount cannot be negative");
    const tQuantity = parseFloat(quantity || "1");
    if (tQuantity < 0) return alert("Quantitiy cannot be negative");
    if(batch?.quantity && tQuantity > batch?.quantity) return alert("Quantity is more than batch")

    onAdd({
      id: searchId,
      name: searchValue,
      selling_price: tAmount,
      payment_type: paymentType,
      quantity: tQuantity,  
    });

    // reset form
    setQuantity("");
    setAmount("0");
    setSearchId("");
    setSearchValue("");

    onClose();
  };

  // useEffect(() => {
  //   const batch = items.filter((item) => item.item_id == searchId && item.is_active)
  //   .sort((a, b) => {
  //     const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
  //     const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
  //     return dateA - dateB;
  //   }
  // );
  //   setBatch(batch[0]);
  // }, [searchValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 -z-10" />
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Add Sale</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SearchBar
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            searchId={searchId}
            setSearchId={setSearchId}
            outline={false}
            setOutline={() => {}}
            onSearch={() => {}}
          />

          {batch && <div className="flex justify-between text-sm text-gray-400">
            <span>Cost Price: {batch.unit_cost}</span>
            <span>•</span>
            <span>Remaining: {batch.quantity - Number(quantity)}</span>
            </div>}

          <div>
            <label className="block mb-1 font-medium">Price of each item</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={amount}
              onChange={(e) => {
                const v = e.target.value;

                // allow empty, digits, and decimals
                if (/^[0-9]*\.?[0-9]*$/.test(v)) {
                  setAmount(v);
                }
              }}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Quantity</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={quantity}
              onChange={(e) => {
                const v = e.target.value;

                // allow empty, digits, and decimals
                if (/^[0-9]*\.?[0-9]*$/.test(v)) {
                  setQuantity(v);
                }
              }}
              required
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

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventorySalesAddModal;
