"use client";

import React, { useState } from "react";

type AddItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    stock_quantity: number;
    unit_price: number;
  }) => void;
};

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0")
  //   const [unitPrice, setUnitPrice] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(unitPrice || "0")
    const quantity = parseFloat(stockQuantity || "0")

    if (!name.trim()) return alert("Name is required");
    if (quantity < 0) return alert("Stock quantity cannot be negative");
    if (price < 0) return alert("Unit price cannot be negative");

    onAdd({ name, stock_quantity: quantity, unit_price: price, });

    // reset form
    setName("");
    setStockQuantity("0");
    setUnitPrice("0");

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 -z-10" />
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Add Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Stock Quantity</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={stockQuantity}
              onChange={(e) => {
                const v = e.target.value;

                // allow empty, digits, and decimals
                if (/^[0-9]*\.?[0-9]*$/.test(v)) {
                  setStockQuantity(v);
                }
              }}
              //   min={1}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Unit Price</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={unitPrice}
              onChange={(e) => {
                const v = e.target.value;

                // allow empty, digits, and decimals
                if (/^[0-9]*\.?[0-9]*$/.test(v)) {
                  setUnitPrice(v);
                }
              }}
              //   min={1}
              //   step={0.01}
              required
            />
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

export default AddItemModal;
