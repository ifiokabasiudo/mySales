"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { DEFAULT_EXPENSE_CATEGORIES } from "../../../expenses/components/constants";
import { offlineInsert } from "@/lib/offline";
import { getSession } from "@/lib/session";
import useOfflineSync from "@/hooks/useOfflineSync";

type AddExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // onAdd: (item: {
  //   category: string;
  //   description?: string;
  //   amount: number;
  // }) => void;
};

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  // onAdd,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const modalRef = React.useRef<HTMLDivElement | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState("Misc.");
  const [typed, setTyped] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);

  const { manualSync } = useOfflineSync();

  useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      }
  
      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
      }
  
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [open]);

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = await getSession();
    
        console.log("Session data:", data);
    
        if (!data?.profile.phone) {
          alert("User not authenticated!");
          return;
        }
    
        let finalExpenses = [...expenses];
    
        // 🔹 Auto-add last typed expense if user forgot to click "Add More"
        if (amount && Number(amount) > 0) {
          finalExpenses.push({
            category: selected,
            description: description.trim() || undefined,
            amount: Number(amount),
          });
        }
    
        if (finalExpenses.length === 0) return;
    
        const now = new Date().toISOString();
    
        // 🔹 Insert each expense as its own row (correct accounting model)
        for (const exp of finalExpenses) {
          await offlineInsert("expenses", {
            id: crypto.randomUUID(),
            phone: data.profile.phone, // TODO: get from auth
            // auth_user_id: null, // TODO: get from auth
            // inventory_sales_id: "", // TODO: link to sale if applicable
            type: "manual",
            category: exp.category,
            note: exp.description,
            amount: exp.amount,
            // quantity: 0,
            // unit_cost: 0,
            // created_at: now,
            // updated_at: now,
          });
        }
    
        // 🔹 Sync when possible
        await manualSync();
    
        alert("Expenses saved offline, would sync when online!");
    
        // 🔹 Reset UI
        setExpenses([]);
        resetForm();

    onClose();
  };

  const resetForm = () => {
    setSelected("Misc.");
    setTyped("");
    setAmount("");
    setDescription("");
    setEditIndex(null);
  };

  const handleAdd = () => {
    if (!amount || Number(amount) <= 0) return;

    const expense = {
      category: selected,
      description: description.trim() || undefined,
      amount: Number(amount),
    };

    if (editIndex !== null) {
      const updated = [...expenses];
      updated[editIndex] = expense;
      setExpenses(updated);
    } else {
      setExpenses((prev) => [...prev, expense]);
    }

    resetForm();
  };

  const handleEdit = (index: number) => {
    const exp = expenses[index];
    setSelected(exp.category);
    setDescription(exp.description ?? "");
    setAmount(String(exp.amount));
    setEditIndex(index);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50" onMouseDown={(e) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  }}>
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 -z-10" />
      <div className="bg-white p-6 rounded-lg w-96" ref={modalRef} onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Add Item</h2>
        <form className="w-full flex flex-col gap-5">
          {/* Expense Dropdown */}
          <div className="relative w-full" ref={dropdownRef}>
            <label>Select Expense</label>

            <div
              onClick={() => setOpen((prev) => !prev)}
              className="w-full text-center font-bold border border-gray-300 bg-white rounded-md px-6 py-2 my-2 hover:cursor-pointer"
            >
              {selected}
            </div>

            {open && (
              <div className="absolute top-[90%] left-0 z-20 max-h-60 overflow-auto bg-white flex flex-col gap-3 p-3 text-gray-700 w-full rounded-md shadow-md">
                {/* Custom input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    placeholder="Or type a custom expense"
                    className="flex-1 border border-gray-300 rounded-md text-center p-2 focus:outline-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (!typed.trim()) return;
                      setSelected(typed.trim());
                      setTyped("");
                      setOpen(false);
                    }}
                    className="border rounded-md p-2 border-gray-300 hover:bg-gray-100"
                  >
                    <Check />
                  </button>
                </div>

                {/* Default categories */}
                {DEFAULT_EXPENSE_CATEGORIES.sort((a, b) =>
                  a.localeCompare(b)
                ).map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      setSelected(item);
                      setTyped("");
                      setOpen(false);
                    }}
                    className="border-b border-gray-200 w-full text-center py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="w-full">
            <label>What was the expense for? (optional)</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md mt-3 p-2 focus:outline-gray-400"
            />
          </div>

          {/* Amount */}
          <div className="w-full">
            <label>Amount (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-md my-3 p-2 focus:outline-gray-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2 w-full">
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 border bg-white border-[#1C8220] text-[#1C8220] py-3 rounded-lg font-semibold hover:cursor-pointer"
            >
              {editIndex !== null ? "Update Item" : "+ Add More"}
            </button>

            <button
              type="submit"
              onClick={handleFinish}
              className="flex-1 bg-[#1C8220] text-white py-3 rounded-lg font-semibold hover:cursor-pointer"
            >
              Finish
            </button>
          </div>
        </form>
        {expenses.length > 0 && (
        <div className="w-full bg-white rounded-md p-4 mt-4">
          <h2 className="font-semibold mb-3">Added Expenses</h2>

          <div className="flex flex-col gap-3">
            {expenses.map((exp, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">{exp.category}</p>
                  {exp.description && (
                    <p className="text-sm text-gray-500">{exp.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-semibold">₦{exp.amount}</span>
                  <button
                    type="button"
                    onClick={() => handleEdit(index)}
                    className="text-sm text-[#1C8220] underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AddExpenseModal;
