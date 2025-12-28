// "use client";

// import Navbar from "@/components/navbar";
// import { useState } from "react";
// import { Check } from "lucide-react";

// const items = [
//   { name: "Number 1" },
//   { name: "Number 2" },
//   { name: "Number 3" },
//   { name: "Number 4" },
// ];

// export default function Expenses() {
//   const [open, setOpen] = useState(false);
//   const [editIndex, setEditIndex] = useState<Number | null>(null);
//   const [selected, setSelected] = useState("Misc.");
//   const [typed, setTyped] = useState("");

//   const DEFAULT_EXPENSE_CATEGORIES = [
//     // Housing
//     "Rent",
//     "Mortgage",
//     "Property Tax",
//     "Home Insurance",
//     "Maintenance & Repairs",

//     // Utilities
//     "Electricity",
//     "Water",
//     "Gas",
//     "Internet",
//     "Cable TV",
//     "Waste Disposal",

//     // Food
//     "Groceries",
//     "Dining Out",
//     "Snacks",

//     // Transportation
//     "Fuel",
//     "Public Transport",
//     "Ride Hailing",
//     "Car Payment",
//     "Car Insurance",
//     "Vehicle Maintenance",
//     "Parking",
//     "Tolls",

//     // Health
//     "Medical Bills",
//     "Health Insurance",
//     "Dental Care",
//     "Vision Care",
//     "Medications",
//     "Fitness / Gym",

//     // Personal
//     "Clothing",
//     "Personal Care",
//     "Haircuts",
//     "Cosmetics",
//     "Laundry",

//     // Education
//     "Tuition",
//     "Books",
//     "Courses",
//     "Certifications",
//     "Workshops",

//     // Work / Business
//     "Office Supplies",
//     "Software Subscriptions",
//     "Internet (Work)",
//     "Phone (Work)",
//     "Equipment",
//     "Coworking Space",

//     // Entertainment
//     "Movies",
//     "Streaming Services",
//     "Games",
//     "Events",
//     "Hobbies",

//     // Financial
//     "Loan Repayment",
//     "Credit Card Payment",
//     "Savings",
//     "Investments",
//     "Bank Fees",

//     // Family
//     "Childcare",
//     "School Fees",
//     "Allowance",
//     "Gifts",

//     // Travel
//     "Flights",
//     "Accommodation",
//     "Local Transport",
//     "Travel Insurance",

//     // Misc
//     "Donations",
//     "Charity",
//     "Religious Contributions",
//     "Emergency Expenses",
//     "Misc.",
//   ];

//   return (
//     <div className="flex flex-col bg-[#ECEFF0] min-h-screen tracking-wider px-4">
//       <Navbar />
//       <div className="w-full flex flex-col gap-5">
//         <h1 className="text-3xl">Expenses</h1>
//         <form className="w-full flex flex-col gap-5 items-center justify-center">
//           <div className="relative w-full">
//             <label>Select Expense</label>
//             <div
//               onClick={() => setOpen(!open)}
//               className="w-full text-center text-black flex-col gap-1 hover:cursor-pointer text-lg font-bold bg-white rounded-md px-20 py-2 my-2"
//             >
//               {selected}
//             </div>

//             {/* ✅ MOBILE MENU */}
//             {open && (
//               <div className="absolute top-[90%] left-0 max-h-60 overflow-auto bg-white flex flex-col items-center gap-3 p-3 text-gray-700 w-full rounded-md my-3">
//                 <div className="flex items-center justify-between w-full">
//                   <input
//                     type="text"
//                     onChange={(e) => {e.preventDefault(); setTyped(e.target.value)}}
//                     placeholder="Or type in an expense"
//                     className="w-full border border-gray-300 rounded-md text-center p-2 focus:outline-gray-400"
//                   />
//                   <div
//                     className="border rounded-md p-2 border-gray-300 hover:cursor-pointer"
//                     onClick={() => {
//                       setSelected(typed);
//                       setOpen(false);
//                     }}
//                   >
//                     <Check />
//                   </div>
//                 </div>
//                 {DEFAULT_EXPENSE_CATEGORIES.sort((a, b) =>
//                   a.localeCompare(b)
//                 ).map((item, index) => (
//                   <div
//                     key={index}
//                     onClick={() => {
//                       setSelected(item);
//                       setOpen(false);
//                     }}
//                     className={`${
//                       index != items.length - 1 ? `border-b` : `pb-1`
//                     } border-gray-200 w-full text-center py-2`}
//                   >
//                     {item}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//           <div className="w-full">
//             <label>What was the expense for? (optional)</label>
//             <textarea
//               rows={4}
//               className="w-full min-h-30 border border-gray-300 rounded-md mt-3 p-2 focus:outline-gray-400"
//             />
//           </div>
//           <div className="w-full">
//             <label>Amount (₦)</label>
//             <input className="w-full border border-gray-300 rounded-md my-3 p-2 focus:outline-gray-400" />
//           </div>
//           <div className="flex gap-3 pt-2 w-full">
//             <button
//               onClick={() => {}}
//               className="flex-1 border bg-white border-[#1C8220] text-[#1C8220] py-3 rounded-lg font-semibold hover:cursor-pointer"
//             >
//               {editIndex !== null ? "Update Item" : "+ Add More"}
//             </button>

//             <button
//               onClick={() => {}}
//               className="flex-1 bg-[#1C8220] text-white py-3 rounded-lg font-semibold hover:cursor-pointer"
//             >
//               Finish
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import Navbar from "@/components/navbar";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { offlineInsert } from "@/lib/offline";
import useOfflineSync from "@/hooks/useOfflineSync";
import { getSession } from "@/lib/session";
import { DEFAULT_EXPENSE_CATEGORIES } from "./components/constants";

type Expense = {
  category: string;
  description?: string;
  amount: number;
};

export default function Expenses() {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState("Misc.");
  const [typed, setTyped] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);

  const { manualSync } = useOfflineSync();

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

    // console.log("EXPENSES:", expenses);

    // optional reset
    // setExpenses([]);
  };

  return (
    <div className="flex flex-col bg-[#ECEFF0] min-h-screen tracking-wider px-4">
      <Navbar />

      <div className="w-full flex flex-col gap-5">
        <h1 className="text-3xl">Expenses</h1>

        <form className="w-full flex flex-col gap-5">
          {/* Expense Dropdown */}
          <div className="relative w-full" ref={dropdownRef}>
            <label>Select Expense</label>

            <div
              onClick={() => setOpen((prev) => !prev)}
              className="w-full text-center font-bold bg-white rounded-md px-6 py-2 my-2 cursor-pointer"
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
      </div>
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
  );
}
