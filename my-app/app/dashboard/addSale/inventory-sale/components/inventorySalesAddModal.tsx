"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "../../components/searchBar";
import { BatchItems } from "@/app/inventory/constants/batch_items";
import { useActiveBatch } from "@/lib/inventory-sales/useActiveBatch";
import { useSafeAction } from "@/hooks/useSafeAction";
import { useInventorySearchGuard } from "@/hooks/useInventorySearchGuard";
import { TableData } from "../../components/newSale";

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
  setTable: React.Dispatch<React.SetStateAction<TableData>>
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
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
  setTable,
  setShowModal,
}) => {
  // const [note, setNote] = useState("");
  const [amount, setAmount] = useState("0");
  const [paymentType, setPaymentType] = useState("Cash");
  const [searchValue, setSearchValue] = useState("");
  const [searchId, setSearchId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [outline, setOutline] = useState(false);
  const options = ["Cash", "POS", "Transfer"];

  const items = BatchItems();
  const isInventoryEmpty = items.length == 0;
  const batch = useActiveBatch(items, searchId);
  const { run, isLoading } = useSafeAction();

  const handleSearchAttempt = useInventorySearchGuard(
    isInventoryEmpty,
    setShowModal,
    setTable
  );

  console.log("The batch in the inventory sales", batch);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    run(async () => {
      if(!searchValue) {setOutline(true); throw new Error ("Please select an Item")}
      const tAmount = parseFloat(amount || "0");
      if (tAmount <= 0) throw new Error("Please add a valid amount");
      const tQuantity = parseFloat(quantity || "1");
      if (tQuantity <= 0) throw new Error("Please add a valid quantity");
      if (batch?.quantity && tQuantity > batch?.quantity)
        throw new Error("Quantity is more than batch");

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
    });
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
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 -z-10" />
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Add Sale</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SearchBar
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            searchId={searchId}
            setSearchId={setSearchId}
            outline={outline}
            setOutline={setOutline}
            onSearch={() => handleSearchAttempt({name: "Inventory", link: "/inventory"})}
          />

          {batch && (
            <div className="flex justify-between text-sm text-gray-400">
              <span>Cost Price: {batch.unit_cost}</span>
              <span>•</span>
              <span>Remaining: {batch.quantity - Number(quantity)}</span>
            </div>
          )}

          <div>
            <label className="block mb-1 font-medium">Price of each item</label>
            <input
              disabled={isLoading}
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
              
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Quantity</label>
            <input
              disabled={isLoading}
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
              disabled={isLoading}
              type="button"
              className={`px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 hover:cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              disabled={isLoading}
              type="submit"
              className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
            >
              {isLoading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventorySalesAddModal;
