"use client";

import { useState, useEffect, useRef } from "react";

export type Period = "daily" | "weekly" | "monthly" | "yearly";

const periods: { label: string; value: Period }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

export function ProfitPeriodDropdown({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-fit" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex justify-between items-center gap-1 rounded-md text-xs font-semibold text-white hover:bg-white/20"
      >
        {value.toUpperCase()}
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* {open && ( */}
        <div className={`absolute right-0 z-10 mt-2 w-36 h-fit rounded-md bg-white shadow-lg ${open ? "" : "hidden"}`}>
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => {
                onChange(p.value);
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-white/10"
            >
              {p.label}
            </button>
          ))}
        </div>
      {/* )} */}
    </div>
  );
}
