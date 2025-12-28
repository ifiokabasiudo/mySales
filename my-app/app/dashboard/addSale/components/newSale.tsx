"use client";
import { useState, useEffect } from "react";
import SearchBar from "./searchBar";
import { offlineInsert } from "@/lib/offline";
import { getSession } from "@/lib/session";
import useOfflineSync from "@/hooks/useOfflineSync";
import { db } from "@/lib/db";
import { useSearchParams } from "next/navigation";

type CartItem = {
  id: string;
  item: string;
  quantity: number;
  paymentType: string;
  amount: string;
};

export default function NewSale() {
  const searchParams = useSearchParams();
  const saleType = searchParams.get("sale");

  const [mode, setMode] = useState<"quick" | "inventory">("quick");
  const [paymentType, setPaymentType] = useState("Cash");
  const [searchValue, setSearchValue] = useState("");
  const [searchId, setSearchId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [quickSaleAmount, setQuickSaleAmount] = useState("e.g. 5000");
  const [inventorySaleAmount, setInventorySaleAmount] = useState("e.g. 5000");
  const [note, setNote] = useState("");
  const options = ["Cash", "POS", "Transfer"];

  useEffect(() => {
    if (saleType === "quick" || saleType === "inventory") {
      setMode(saleType);
    } else {
      setMode("quick"); // default
    }
  }, [saleType]);

  const { manualSync } = useOfflineSync();

  const buildCurrentItem = (): CartItem | null => {
    if (!searchValue || !searchId) return null;

    return {
      id: searchId,
      item: searchValue,
      quantity,
      paymentType,
      amount: inventorySaleAmount,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode !== "quick" && mode !== "inventory") {
      return alert("Please select a mode");
    }

    const data = await getSession();

    console.log("Session data:", data);

    if (!data?.profile.phone) {
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

    if (mode === "quick") {
      const amount = parseFloat(quickSaleAmount || "0");
      if (amount < 0) return alert("Amount cannot be negative");

      await offlineInsert("quick_sales", {
        id: crypto.randomUUID(), // needed so Dexie + Supabase share same ID
        phone: data.profile.phone,
        // auth_user_id: null,
        // item_code: "ITEM-0200",
        total_amount: amount,
        note: note,
        mode: paymentType,
        status: "pending",
        reconciled_amount: 0,
        // created_at: formatDate(new Date()),
      });

      setQuickSaleAmount("");
      setNote("");

      await manualSync();

      alert("Item was saved offline, would sync when online!");
    } else {
      const amount = parseFloat(inventorySaleAmount || "0");
      if (amount < 0) return alert("Amount cannot be negative");

      console.log("This is the search value", searchValue);

      let itemsToSave = cart;

      if (itemsToSave.length === 0) {
        const singleItem = buildCurrentItem();
        if (!singleItem) {
          alert("Please add an item");
          return;
        }
        itemsToSave = [singleItem];
      }

      await db.transaction(
        "rw",
        db.inventory_sales,
        db.inventory_batches,
        db.pending_sync,
        async () => {
          for (const item of itemsToSave) {
            await offlineInsert("inventory_sales", {
              id: crypto.randomUUID(),
              phone: data.profile.phone,
              item_id: item.id,
              name: item.item,
              quantity: item.quantity,
              selling_price: item.amount,
              payment_type: item.paymentType,
              // created_at: formatDate(new Date()),
            });
          }
        }
      );

      itemsToSave = [];
      setCart([]);
      setSearchValue("");
      setSearchId("");
      setQuantity(1);
      setInventorySaleAmount("");

      await manualSync();

      alert("Item was saved offline, would sync when online!");
    }
  };

  const handleAddMore = () => {
    if (!searchValue) return alert("Select an item first!");
    const amount = parseFloat(inventorySaleAmount || "0");
    if (!amount || amount < 0) return alert("Please enter an amount");

    if (editIndex !== null) {
      // EDIT EXISTING ITEM
      setCart((prev) =>
        prev.map((item, index) =>
          index === editIndex
            ? {
                id: searchId,
                item: searchValue,
                quantity,
                paymentType,
                amount: inventorySaleAmount,
              }
            : item
        )
      );
      setEditIndex(null);
    } else {
      // ADD NEW ITEM
      setCart((prev) => [
        ...prev,
        {
          id: searchId,
          item: searchValue,
          quantity,
          paymentType,
          amount: inventorySaleAmount,
        },
      ]);
    }

    setSearchId("");
    setSearchValue("");
    setQuantity(1);
  };

  const handleDelete = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number) => {
    const item = cart[index];
    setSearchId(item.id);
    setSearchValue(item.item);
    setQuantity(item.quantity);
    setPaymentType(item.paymentType);
    setInventorySaleAmount(item.amount);
    setEditIndex(index);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-sm p-4">
        <h2 className="text-3xl font-semibold mb-4">Add Sale</h2>

        {/* Toggle */}
        <div className="relative flex rounded-lg text-lg bg-[#1C8220] overflow-hidden mb-6">
          <div
            className={`bg-[#ECEFF0] absolute top-1/2 transform -translate-y-1/2  ${
              mode === "quick"
                ? "translate-x-0 left-1"
                : "translate-x-[94%] left-1"
            } rounded-md h-[80%] w-1/2 transition-transform duration-300 z-0`}
          />

          <button
            className={`flex-1 py-2 font-semibold hover:cursor-pointer z-10 ${
              mode !== "quick" ? "text-[#ECEFF0]" : `text-[#1C8220]`
            } transition-colors duration-300`}
            onClick={() => setMode("quick")}
          >
            Quick
          </button>

          <button
            className={`flex-1 py-2 font-semibold z-10 hover:cursor-pointer ${
              mode !== "inventory" ? "text-[#ECEFF0]" : `text-[#1C8220]`
            } transition-colors duration-300`}
            onClick={() => setMode("inventory")}
          >
            Inventory
          </button>
        </div>

        {/* QUICK SALE MODE */}
        {mode === "quick" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-full">
              <label className="text-sm mb-1 text-slate-500 block">
                Amount (₦)
              </label>
              <input
                type="number"
                value={quickSaleAmount}
                onChange={(e) => {
                  const v = e.target.value;

                  // allow empty, digits, and decimals
                  if (/^[0-9]*\.?[0-9]*$/.test(v)) {
                    setQuickSaleAmount(v);
                  }
                }}
                placeholder="e.g, 5000"
                className="w-full border border-slate-500 focus:outline-slate-600 rounded-lg p-3"
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

            <textarea
              placeholder="Note (optional, it would help you remember later)"
              className="w-full border rounded-lg border-slate-500 focus:outline-slate-600 p-3"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
              }}
              rows={3}
            />

            <button
              type="submit"
              className="w-full bg-[#1C8220] text-white py-3 rounded-lg font-semibold hover:cursor-pointer"
            >
              Submit
            </button>
          </form>
        )}

        {/* INVENTORY SALE MODE */}
        {mode === "inventory" && (
          <div className="space-y-4">
            <SearchBar
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              searchId={searchId}
              setSearchId={setSearchId}
            />

            <div>
              <label className="text-sm mb-1 text-slate-500 block">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                placeholder="Quantity"
                className="w-full border border-slate-500 focus:outline-slate-600 rounded-lg p-3"
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              />
            </div>

            <div className="w-full">
              <label className="text-sm mb-1 text-slate-500 block">
                Price of one item (₦)
              </label>
              <input
                type="number"
                value={inventorySaleAmount}
                onChange={(e) => {
                  const v = e.target.value;

                  // allow empty, digits, and decimals
                  if (/^[0-9]*\.?[0-9]*$/.test(v)) {
                    setInventorySaleAmount(v);
                  }
                }}
                placeholder="e.g, 5000"
                className="w-full border border-slate-500 focus:outline-slate-600 rounded-lg p-3"
                required
              />
            </div>

            <div className="flex gap-2">
              {["Cash", "POS", "Transfer"].map((type) => (
                <button
                  key={type}
                  onClick={() => setPaymentType(type)}
                  className={`px-4 py-2 rounded-lg border transition ${
                    paymentType === type
                      ? "bg-[#1C8220] text-white border-[#1C8220]"
                      : "bg-white text-black border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddMore}
                className="flex-1 border bg-white border-[#1C8220] text-[#1C8220] py-3 rounded-lg font-semibold hover:cursor-pointer"
              >
                {editIndex !== null ? "Update Item" : "+ Add More"}
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#1C8220] text-white py-3 rounded-lg font-semibold hover:cursor-pointer"
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
      {cart.length > 0 && mode == "inventory" && (
        <div className="border rounded-lg p-3 space-y-3 bg-gray-50 w-full">
          <h3 className="font-semibold text-lg">Added Items</h3>

          {cart.map((cartItem, index) => (
            <div
              key={index}
              className="flex justify-between items-center border p-2 rounded-md"
            >
              <div>
                <p className="font-medium">{cartItem.item}</p>
                <p className="text-sm text-gray-600">
                  Qty: {cartItem.quantity} • {cartItem.paymentType}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="px-3 py-1 text-sm border rounded text-blue-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(index)}
                  className="px-3 py-1 text-sm border rounded text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
