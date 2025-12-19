"use client";

import React, { useState } from "react";
import SearchBar from "../../components/searchBar";

type AddItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: { id: string; name: string; selling_price: number; payment_type: string; quantity: number }) => void;
};

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
  const options = ["Cash", "POS", "Transfer"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tAmount = parseFloat(amount || "0");
    if (tAmount < 0) return alert("Amount cannot be negative");
    const tQuantity = parseFloat(quantity || "1");
    if (tQuantity < 0) return alert("Quantitiy cannot be negative");

    onAdd({ id: searchId, name: searchValue, selling_price: tAmount, payment_type: paymentType, quantity: tQuantity });

    // reset form
    setQuantity("");
    setAmount("0");
    setSearchId("");
    setSearchValue("");


    onClose();
  };

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
          />

          <div>
            <label className="block mb-1 font-medium">
              Price of each item
            </label>
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
            <label className="block mb-1 font-medium">
              Quantity
            </label>
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
