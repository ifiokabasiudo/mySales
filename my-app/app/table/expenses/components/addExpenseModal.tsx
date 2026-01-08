"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Check } from "lucide-react";
import { DEFAULT_EXPENSE_CATEGORIES } from "../../../expenses/components/constants";
import { offlineInsert } from "@/lib/offline";
import { getSession } from "@/lib/session";
import useOfflineSync from "@/hooks/useOfflineSync";
import { useSafeAction } from "@/hooks/useSafeAction";
import { ChevronDown } from "@deemlol/next-icons";
import { X } from "lucide-react";

type AddExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRequestDelete: (index: number) => void;
};

export type AddExpenseModalRef = {
  handleRemove: (index: number) => void;
};

const AddExpenseModal = forwardRef<AddExpenseModalRef, AddExpenseModalProps>(
  function AddExpenseModal({ isOpen, onClose, onRequestDelete }, ref) {
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

    const { run, isLoading } = useSafeAction();

    const handleRemove = (index: number | null) => {
      if (index == null) throw new Error("Expense to delete not Chosen");

      run(
        async () => {
          setExpenses((prev) => prev.filter((_, i) => i !== index));

          // If the removed item was being edited, reset the form
          if (editIndex === index) {
            resetForm();
          }

          // If an earlier item was removed, shift editIndex
          if (editIndex !== null && index < editIndex) {
            setEditIndex(editIndex - 1);
          }
        },
        { loading: "Removing...", success: "Removed" }
      );
    };

    useImperativeHandle(ref, () => ({
      handleRemove,
    }));

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }

      return () => {
        document.body.style.overflow = "";
      };
    }, [isOpen]);

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

      await run(
        async () => {
          const data = await getSession();

          console.log("Session data:", data);

          if (!data?.profile.phone) {
            throw new Error("User not authenticated!");
          }

          let finalExpenses = [...expenses];

          if (Number(amount) <= 0 && finalExpenses.length < 1) {
            throw new Error("Enter an Amount");
          }

          if (!selected && finalExpenses.length < 1) {
            throw new Error("Please choose an Expense");
          }

          if (!selected && Number(amount) <= 0 && finalExpenses.length < 1) {
            throw new Error("Please Add an Expense");
          }

          // 🔹 Auto-add last typed expense if user forgot to click "Add More"
          if (amount && Number(amount) > 0) {
            finalExpenses.push({
              category: selected,
              description: description.trim() || undefined,
              amount: Number(amount),
            });
          }

          if (finalExpenses.length === 0)
            throw new Error("No Expense was added");

          // const now = new Date().toISOString();

          // 🔹 Insert each expense as its own row (correct accounting model)
          for (const exp of finalExpenses) {
            await offlineInsert("expenses", {
              id: crypto.randomUUID(),
              phone: data.profile.phone,
              type: "manual",
              category: exp.category,
              note: exp.description,
              amount: exp.amount,
            });
          }

          // 🔹 Sync when possible
          await manualSync();

          // 🔹 Reset UI
          setExpenses([]);
          resetForm();

          onClose();
        },
        { loading: "Adding Expense...", success: "Expense Added Successfully" }
      );
    };

    const resetForm = () => {
      setSelected("Misc.");
      setTyped("");
      setAmount("");
      setDescription("");
      setEditIndex(null);
    };

    const handleAdd = () => {
      run(
        async () => {
          if (!amount || Number(amount) <= 0)
            throw new Error("Enter a valid amount");
          if (!selected) throw new Error("Enter an expense");

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
        },
        { loading: "Adding...", success: "Added" }
      );
    };

    //   const AddExpenseModal = forwardRef<
    //   AddExpenseModalRef,
    //   AddExpenseModalProps
    // >((props, ref) => {
    //   useImperativeHandle(ref, () => ({
    //   handleRemove,
    // }));

    const handleEdit = (index: number) => {
      const exp = expenses[index];
      setSelected(exp.category);
      setDescription(exp.description ?? "");
      setAmount(String(exp.amount));
      setEditIndex(index);
    };

    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 px-4"
        onMouseDown={(e) => {
          if (
            modalRef.current &&
            !modalRef.current.contains(e.target as Node)
          ) {
            onClose();
          }
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 -z-10" />
        <div
          className="bg-white p-6 rounded-lg w-96 relative overflow-auto max-h-[80dvh]"
          ref={modalRef}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X className="absolute top-5 right-5" onClick={() => onClose()} />
          <h2 className="text-xl font-semibold mb-4">Add Item</h2>
          <form className="w-full flex flex-col gap-5">
            {/* Expense Dropdown */}
            <div className="w-full">
              <label>Select Expense</label>

              <div className="relative w-full" ref={dropdownRef}>
                <div
                  onClick={() => setOpen((prev) => !prev)}
                  className="relative w-full text-center font-bold border border-gray-300 bg-white rounded-md px-6 py-2 my-2 hover:cursor-pointer"
                >
                  {selected}
                  <ChevronDown
                    size={24}
                    color="black"
                    className="absolute top-1/2 -translate-y-1/2 right-5"
                  />
                </div>

                {open && (
                  <div className="absolute top-[90%] left-0 z-20 max-h-60 overflow-auto bg-white flex flex-col gap-3 p-3 text-gray-700 w-full rounded-md shadow-md">
                    {/* Custom input */}
                    <div className="flex gap-2">
                      <input
                        disabled={isLoading}
                        type="text"
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        placeholder="Or type a custom expense"
                        className="flex-1 border border-gray-300 rounded-md text-center p-2 focus:outline-gray-400"
                      />

                      <button
                        disabled={isLoading}
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
                    {!isLoading &&
                      DEFAULT_EXPENSE_CATEGORIES.sort((a, b) =>
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
            </div>

            {/* Description */}
            <div className="w-full">
              <label>What was the expense for? (optional)</label>
              <textarea
                disabled={isLoading}
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
                disabled={isLoading}
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-md my-3 p-2 focus:outline-gray-400"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2 w-full">
              <button
                disabled={isLoading}
                type="button"
                onClick={handleAdd}
                className={`flex-1 border bg-white border-[#1C8220] text-[#1C8220] py-3 rounded-lg font-semibold hover:cursor-pointer ${
                  isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""
                }`}
              >
                {editIndex !== null ? "Update" : "+ Add More"}
              </button>

              <button
                disabled={isLoading || editIndex !== null}
                type="submit"
                onClick={handleFinish}
                className={`flex-1 bg-[#1C8220] text-white py-3 rounded-lg font-semibold hover:cursor-pointer ${
                  isLoading || editIndex != null
                    ? "opacity-50 cursor-not-allowed animate-pulse"
                    : ""
                }`}
              >
                {isLoading ? "Storing..." : "Finish"}
              </button>
            </div>
          </form>
          {expenses.length > 0 && (
            <div className="w-full bg-white rounded-lg border border-gray-300 py-4 mt-4">
              <h2 className="font-semibold mb-3 px-4">Added Expenses</h2>

              <div className="flex flex-col gap-3">
                {expenses.map((exp, index) => (
                  <div
                    key={index}
                    className={`flex flex-col gap-2 w-full items-center py-2 px-4 ${
                      expenses.length - 1 != index
                        ? "border-b border-gray-300"
                        : "pb-0"
                    }`}
                  >
                    <div className="flex w-full justify-between">
                      <p className="font-medium">{exp.category}</p>
                      <span className="font-semibold">₦{exp.amount}</span>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-500 w-full">
                        {exp.description}
                      </p>
                    )}

                    <div className="flex w-full items-center gap-3">
                      <button
                        disabled={isLoading}
                        type="button"
                        onClick={() => handleEdit(index)}
                        className={`text-sm py-1 border rounded w-1/2 text-white bg-[#1C8220] ${
                          isLoading
                            ? "opacity-50 cursor-not-allowed animate-pulse"
                            : ""
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        disabled={isLoading}
                        type="button"
                        onClick={() => {
                          onRequestDelete(index);
                        }}
                        className={`text-sm py-1 border rounded w-1/2 text-white bg-rose-600 ${
                          isLoading
                            ? "opacity-50 cursor-not-allowed animate-pulse"
                            : ""
                        }`}
                      >
                        Remove
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
  }
);

export default AddExpenseModal;
