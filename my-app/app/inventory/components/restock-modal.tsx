"use client";

import { InventoryItems } from "../../dashboard/addSale/constants/inventory_items";
import React, { useState, useEffect, useRef } from "react";

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
  const [searchId, setSearchId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [stockQuantity, setStockQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

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
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 -z-10" />
      <div className="bg-white p-6 rounded-lg w-96" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Restock</h2>
        <div ref={wrapperRef} className="mb-4 relative">
          {step === "select" && (
            <>
              <input
                type="text"
                value={searchValue}
                placeholder="Search Item..."
                className="w-full px-4 py-2 border border-slate-500 rounded-md"
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
                        className="bg-slate-200 text-slate-700 rounded-sm py-1 px-4 hover:cursor-pointer"
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
                type="number"
                placeholder="Quantity"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="px-4 py-2 border border-slate-500 rounded-md"
              />

              <input
                type="number"
                placeholder="Unit price"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="px-4 py-2 border border-slate-500 rounded-md"
              />

              <div className="flex justify-between">
                <button
                  className="text-sm text-gray-500 hover:underline hover:cursor-pointer"
                  onClick={() => setStep("select")}
                >
                  ← Back
                </button>

                <button
                  className="bg-slate-700 text-white px-4 py-2 rounded hover:cursor-pointer"
                  onClick={() => {
                    onAdd({
                      id: selectedItem.id,
                      name:selectedItem.name,
                      stock_quantity: Number(stockQuantity),
                      unit_price: Number(unitPrice),
                    });

                    // reset
                    setStep("select");
                    setSelectedItem(null);
                    setStockQuantity("");
                    setUnitPrice("");
                    handleClose();
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
          {/* <input
            type="text"
            value={searchValue}
            placeholder="Search Item..."
            className="w-full px-4 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearchValue(e.target.value)}
          />

          <button
            type="button"
            onMouseDown={(e) => {
              e.stopPropagation();
              //   setActiveSearch(items);
            }}
            className="absolute right-2 top-1.5 p-1 rounded-md border border-slate-500 hover:bg-gray-100 hover:cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="stroke-black w-5 h-5"
            >
              <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" />
            </svg>
          </button>

          <div className="max-h-[80dvh] mt-5 w-full z-50 overflow-hidden">
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
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center py-2 px-4 rounded bg-slate-700 text-white`}
                >
                  <div>{item.name}</div>
                  <button
                    className="bg-slate-200 text-slate-700 rounded-sm py-1 px-4 hover:cursor-pointer"
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
          </div> */}
          {/* )} */}
        </div>
      </div>
    </div>
  );
};

export default RestockModal;
