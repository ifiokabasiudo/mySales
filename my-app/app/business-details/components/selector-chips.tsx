// // import { BUSINESS_CATEGORIES } from "../constants/businesses";

// // export default function SelectorChips() {


// //   return (
// //     <div className="flex flex-col items-center w-full">
// //         <h1 className="text-3xl">Type of Business</h1>
// //     <div className="flex flex-wrap gap-2 text-[#1C8220] mt-4 px-7">
// //       {BUSINESS_CATEGORIES.map((category) => (
// //         <div
// //           key={category}
// //           className="cursor-pointer rounded-full border border-[#1C8220] px-4 py-2 text-sm hover:bg-[#1C8220] hover:text-white transition-colors"
// //         >
// //           {category}
// //         </div>
// //       ))}
// //     </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useState } from "react";
// import { BUSINESS_CATEGORIES } from "../constants/businesses";

// export default function SelectorChips() {
//   const [selected, setSelected] = useState<string>("");
//   const [showModal, setShowModal] = useState(false);
//   const [customType, setCustomType] = useState("");

//   function handleSelect(category: string) {
//     if (category === "Other") {
//       setShowModal(true);
//     } else {
//       setSelected(category);
//     }
//   }

//   function saveCustomType() {
//     if (!customType.trim()) return;
//     setSelected(customType);
//     setShowModal(false);
//     setCustomType("");
//   }

//   return (
//     <div className="flex flex-col items-center w-full">
//       <h1 className="text-3xl">Type of Business</h1>

//       <div className="flex flex-wrap gap-2 text-[#1C8220] mt-4 px-7">
//         {BUSINESS_CATEGORIES.map((category) => (
//           <div
//             key={category}
//             onClick={() => handleSelect(category)}
//             className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors
//               ${
//                 selected === category
//                   ? "bg-[#1C8220] text-white border-[#1C8220]"
//                   : "border-[#1C8220] text-[#1C8220] hover:bg-[#1C8220] hover:text-white"
//               }
//             `}
//           >
//             {category}
//           </div>
//         ))}
//       </div>

//       {/* ✅ Selected Output (optional preview) */}
//       {selected && (
//         <p className="mt-4 text-sm text-gray-600">
//           Selected: <span className="font-semibold">{selected}</span>
//         </p>
//       )}

//       {/* ✅ MODAL */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm">
//             <h2 className="text-xl font-semibold mb-3">
//               Enter Your Business Type
//             </h2>

//             <input
//               type="text"
//               value={customType}
//               onChange={(e) => setCustomType(e.target.value)}
//               placeholder="e.g. Car Wash, Gaming Center..."
//               className="w-full border rounded px-3 py-2 outline-none mb-4"
//             />

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 py-2 text-sm border rounded"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={saveCustomType}
//                 className="px-4 py-2 text-sm bg-[#1C8220] text-white rounded"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { BUSINESS_CATEGORIES } from "../constants/businesses";

interface Props {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
}

export default function SelectorChips({
  selectedCategory,
  setSelectedCategory,
}: Props) {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState("");

  function handleSelect(category: string) {
    if (category === "Other") {
      setShowOtherInput(true);
      setSelectedCategory("");
    } else {
      setShowOtherInput(false);
      setSelectedCategory(category);
    }
  }

  function handleOtherSave() {
    if (!otherValue.trim()) return;
    setSelectedCategory(otherValue);
    setShowOtherInput(false);
  }

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl">Type of Business</h1>

      <div className="flex flex-wrap gap-2 text-[#1C8220] mt-4">
        {BUSINESS_CATEGORIES.map((category) => (
          <div
            key={category}
            onClick={() => handleSelect(category)}
            className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors
              ${
                selectedCategory === category
                  ? "bg-[#1C8220] text-white border-[#1C8220]"
                  : "border-[#1C8220] hover:bg-[#1C8220] hover:text-white"
              }
            `}
          >
            {category}
          </div>
        ))}
      </div>

      {/* ✅ OTHER POPUP */}
      {showOtherInput && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-sm">
            <h2 className="text-lg mb-3">Enter Business Type</h2>

            <input
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              className="border w-full px-3 py-2 rounded mb-4"
              placeholder="e.g. Car Wash"
            />

            <button
              onClick={handleOtherSave}
              className="bg-[#1C8220] text-white px-4 py-2 rounded w-full"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
