"use client";

import Navbar from "@/components/navbar";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { offlineInsert } from "@/lib/offline";
import useOfflineSync from "@/hooks/useOfflineSync";
import { getSession } from "@/lib/session";
import { DEFAULT_EXPENSE_CATEGORIES } from "./components/constants";
import { ChevronDown } from "@deemlol/next-icons";
import { useSafeAction } from "@/hooks/useSafeAction";
import Modal from "@/components/modal-component";
import GlobalButton from "@/components/globalButton";
import { TableData } from "../dashboard/addSale/components/newSale";

// type Expense = {
//   category: string;
//   description?: string;
//   amount: number;
// };

export default function Expenses() {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState("Misc.");
  const [typed, setTyped] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false)
  const [table, setTable] = useState<TableData | null>(null)
  const [chosen, setChosen] = useState<number | null>(null)

  const { manualSync } = useOfflineSync();

  const { run, isLoading } = useSafeAction();

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // ✅ Close dropdown when clicking outside
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

  const handleEdit = (index: number) => {
    // run(
    //   async () => {
        const exp = expenses[index];
        setSelected(exp.category);
        setDescription(exp.description ?? "");
        setAmount(String(exp.amount));
        setEditIndex(index);
    //   },
    //   { loading: "Editing...", success: "Edited" }
    // );
  };

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

        if(Number(amount) <= 0 && finalExpenses.length < 1 ) {
          throw new Error("Enter an Amount")
        }

        if(!selected && finalExpenses.length < 1) {
          throw new Error("Please choose an Expense")
        }

        if(!selected && Number(amount) <= 0 && finalExpenses.length < 1) {
          throw new Error("Please Add an Expense")
        }

        // 🔹 Auto-add last typed expense if user forgot to click "Add More"
        if (amount && Number(amount) > 0) {
          finalExpenses.push({
            category: selected,
            description: description.trim() || undefined,
            amount: Number(amount),
          });
        }

        if (finalExpenses.length === 0) throw new Error ("No Expense was added");

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

        await manualSync();

        setExpenses([]);
        resetForm();
      },
      { loading: "Adding Expense...", success: "Expense Added Successfully" }
    );
  };

  const handleRemove = (index: number | null) => {
    // if (!confirm("Remove this expense?")) return;
    if(index == null) throw new Error("Expense to delete not Chosen")

    run(
      async () => {
        setExpenses((prev) => prev.filter((_, i) => i !== index));

        // If the removed item was being edited, reset the form
        if (editIndex === index) {
          resetForm();
        }

        setChosen(null)

        // If an earlier item was removed, shift editIndex
        if (editIndex !== null && index < editIndex) {
          setEditIndex(editIndex - 1);
        }
        setShowModal(false)
      },
      { loading: "Removing...", success: "Removed" }
    );
  };

  return (
    <div className="flex flex-col bg-[#ECEFF0] min-h-screen tracking-wider px-4">
      <Navbar />

      <div className="w-full flex flex-col gap-5">
        <h1 className="text-3xl">Expenses</h1>

        <form className="w-full flex flex-col gap-5">
          {/* Expense Dropdown */}
          <div className="w-full">
            <label>Select Expense</label>

            <div ref={dropdownRef} className="relative w-full">
              <div
                onClick={() => setOpen((prev) => !prev)}
                className="relative w-full text-center font-bold bg-white rounded-md px-6 py-2 my-2 cursor-pointer"
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
              className={`flex-1 border bg-white border-[#1C8220] text-[#1C8220] py-3 rounded-lg font-semibold hover:cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
            >
              {editIndex !== null ? "Update Expense" : "+ Add More"}
            </button>

            <button
              disabled={isLoading || editIndex !== null}
              type="submit"
              onClick={handleFinish}
              className={`flex-1 bg-[#1C8220] text-white py-3 rounded-lg font-semibold hover:cursor-pointer ${isLoading || editIndex !== null ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
            >
              {isLoading ? "Storing..." : "Finish"}
            </button>
          </div>
        </form>
      </div>
      {expenses.length > 0 && (
        <div className="w-full bg-white rounded-lg border border-gray-300 py-4 mt-4">
          <h2 className="font-semibold mb-3 px-4">Added Expenses</h2>

          <div className="flex flex-col gap-3">
            {expenses.map((exp, index) => (
              <div
                key={index}
                className={`flex justify-between items-center py-2 px-4 ${expenses.length - 1 != index ? "border-b border-gray-300" : "pb-0"}`}
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
                    disabled={isLoading}
                    type="button"
                    onClick={() => handleEdit(index)}
                    className={`text-sm py-1 px-3 border rounded text-white bg-[#1C8220] ${isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
                  >
                    Edit
                  </button>
                  <button
                    disabled={isLoading}
                    type="button"
                    onClick={() => {setShowModal(true); setChosen(index)}}
                    className={`text-sm py-1 px-3 border rounded text-white bg-rose-600 ${isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Modal
          show={showModal}
          setShow={setShowModal}
          alignment="center"
          isIntercepting={true}
          showCancelBtnINSmallDevice={true}
          setTable={setTable}
        >
          <div className="flex flex-col gap-2">
            <h1>Are you sure you want to delete the expense?</h1>
            <GlobalButton buttonName="Delete" buttonColor="bg-rose-600" link={null} handleClick={handleRemove} index={chosen} />
          </div>
        </Modal>
    </div>
  );
}

// Make the finish button disabled while updating an item
