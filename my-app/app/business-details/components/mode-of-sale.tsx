// "use client";

// import { useState } from "react";

// export default function ModeOfSale() {
//   const [modes, setModes] = useState<string[]>([]);

//   const options = ["Cash", "POS", "Transfer"];

//   function toggleMode(item: string) {
//     setModes((prev) =>
//       prev.includes(item)
//         ? prev.filter((m) => m !== item) // remove
//         : [...prev, item] // add
//     );
//   }

//   return (
//     <div className="flex flex-col text-center w-full mt-8 px-7">
//       <h1 className="text-3xl">Mode Of Sale</h1>
//       <p className="text-center text-gray-500 text-sm mb-5">
//         Please select at least one
//       </p>

//       {options.map((item) => {
//         const selected = modes.includes(item);

//         return (
//           <label
//             key={item}
//             className="flex items-center gap-4 cursor-pointer"
//           >
//             {/* Hidden checkbox */}
//             <input
//               type="checkbox"
//               checked={selected}
//               onChange={() => toggleMode(item)}
//               className="hidden"
//             />

//             {/* Custom styled box */}
//             <div
//               className={`w-4 h-4 rounded border-2 flex items-center justify-center
//                 ${selected ? "border-[#1C8220] bg-[#1C8220]" : "border-black"}
//               `}
//             >
//               {selected && (
//                 <div className="w-2 h-2 bg-white rounded" />
//               )}
//             </div>

//             {/* Label */}
//             <span className="text-lg font-serif text-black">
//               {item}
//             </span>
//           </label>
//         );
//       })}
//     </div>
//   );
// }

"use client";

interface Props {
  modes: string[];
  setModes: (value: string[]) => void;
}

export default function ModeOfSale({ modes, setModes }: Props) {
  const options = ["Cash", "POS", "Transfer"];

  function toggleMode(item: string) {
    if (modes.includes(item)) {
      setModes(modes.filter((m) => m !== item));
    } else {
      setModes([...modes, item]);
    }
  }

  return (
    <div className="space-y-3 flex flex-col text-center w-full mt-8">
      <h1 className="text-2xl">Mode Of Sale</h1>
      <p className="text-gray-500 text-sm mb-5">You can select multiple</p>

      {options.map((item) => (
        <label key={item} className="flex items-center gap-4 cursor-pointer">
          <input type="checkbox" hidden />

          <div onClick={() => toggleMode(item)} className="flex gap-3 items-center">
            <div            
            className={`w-4 h-4 rounded border-2 flex items-center justify-center
              ${modes.includes(item) ? "border-[#1C8220] bg-[#1C8220]" : "border-black"}
            `}
          >
            {modes.includes(item) && (
              <div className="w-2 h-2 bg-white rounded" />
            )}
          </div>

          <span className="text-lg font-serif text-black">{item}</span>
          </div>
        </label>
      ))}
    </div>
  );
}

