"use client";

import { InventoryItems } from "../../dashboard/addSale/constants/inventory_items";
import React, { useState, useEffect, useRef } from "react";
import { useSafeAction } from "@/hooks/useSafeAction";

type RestockModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    id: string;
    name: string;
    stock_quantity: number;
    unit_price: number;
  }) => void;
};

const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [step, setStep] = useState<"select" | "form">("select");
  // const [searchId, setSearchId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [stockQuantity, setStockQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const { run, isLoading } = useSafeAction();

  const items = InventoryItems();

  const filteredItems = React.useMemo(() => {
    if (!searchValue.trim()) return items;

    return items.filter((item) =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [items, searchValue]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const handleClose = () => {
    setStep("select");
    setSelectedItem(null);
    setSearchValue("");
    setStockQuantity("");
    setUnitPrice("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 px-4"
      onClick={handleClose}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 -z-10" />
      <div
        className="bg-white p-6 rounded-lg w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Restock</h2>
        <div ref={wrapperRef} className="mb-4 relative">
          {step === "select" && (
            <>
              <input
                disabled={isLoading}
                type="text"
                value={searchValue}
                placeholder="Search Item..."
                className={`w-full px-4 py-2 border border-slate-500 rounded-md ${
                  isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""
                }`}
                onChange={(e) => setSearchValue(e.target.value)}
              />

              <div className="max-h-[80dvh] mt-5 w-full overflow-hidden">
                <div
                  className="overflow-y-auto flex flex-col gap-2
      [&::-webkit-scrollbar]:w-1
      [&::-webkit-scrollbar-track]:rounded-full
      [&::-webkit-scrollbar-track]:bg-gray-100
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-gray-300
      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                >
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 px-4 rounded bg-slate-700 text-white"
                    >
                      <span>{item.name}</span>
                      <button
                        disabled={isLoading}
                        className={`bg-slate-200 text-slate-700 rounded-sm py-1 px-4 hover:cursor-pointer ${
                          isLoading
                            ? "opacity-50 cursor-not-allowed animate-pulse"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedItem({ id: item.id, name: item.name });
                          setStep("form");
                        }}
                      >
                        Restock
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === "form" && selectedItem && (
            <div className="flex flex-col gap-4">
              <div className="text-sm text-gray-600">
                Restocking: <strong>{selectedItem.name}</strong>
              </div>

              <input
                disabled={isLoading}
                type="number"
                placeholder="Quantity"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="px-4 py-2 border border-slate-500 rounded-md"
              />

              <input
                disabled={isLoading}
                type="number"
                placeholder="Unit price"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="px-4 py-2 border border-slate-500 rounded-md"
              />

              <div className="flex justify-between">
                <button
                  disabled={isLoading}
                  className="text-sm text-gray-500 hover:underline hover:cursor-pointer"
                  onClick={() => setStep("select")}
                >
                  ← Back
                </button>

                <button
                  disabled={isLoading}
                  className={`bg-slate-700 text-white px-4 py-2 rounded hover:cursor-pointer ${
                          isLoading
                            ? "opacity-50 cursor-not-allowed animate-pulse"
                            : ""
                        }`}
                  onClick={() => {
                    run(async () => {
                      if(Number(stockQuantity) <= 0) throw new Error ("Enter a valid quantity")
                      if(Number(unitPrice) <= 0) throw new Error ("Enter a valid price")
                        
                      onAdd({
                      id: selectedItem.id,
                      name: selectedItem.name,
                      stock_quantity: Number(stockQuantity),
                      unit_price: Number(unitPrice),
                    });

                    // reset
                    setStep("select");
                    setSelectedItem(null);
                    setStockQuantity("");
                    setUnitPrice("");
                    handleClose();
                    })
                  }}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestockModal;
