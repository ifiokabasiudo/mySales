"use client";

import { useState, ChangeEvent, useEffect, useRef } from "react";
import { InventoryItems } from "../constants/inventory_items";

export default function SearchBar({
  searchValue,
  setSearchValue,
  searchId,
  setSearchId,
  outline, 
  setOutline,
  onSearch
}: {
  searchValue: string;
  setSearchValue: (value: string) => void;
  searchId: string;
  setSearchId: (value: string) => void;
  outline: boolean;
  setOutline: React.Dispatch<React.SetStateAction<boolean>>;
  onSearch: () => void
}) {
  const items = InventoryItems();

  const [activeSearch, setActiveSearch] = useState<
    { id: string; name: string; soft_deleted?: boolean }[]
  >([]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // 🔥 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setActiveSearch([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    setActiveSearch(
      items.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  return (
    <div ref={wrapperRef} className="mb-4 relative">
      <input
        type="text"
        value={searchValue}
        placeholder="Type the item..."
        className={`w-full px-4 py-2 border border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${outline ? 'outline-3 outline-cyan-500' : ''}`}
        onClick={() => {setOutline(false); onSearch();}}
        onChange={(e) => handleSearch(e)}
        onFocus={() => setActiveSearch(items)}
      />

      <button
        type="button"
        onMouseDown={(e) => {
          e.stopPropagation();
          setActiveSearch(items);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md border border-slate-500 hover:bg-gray-100 hover:cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 640"
          className="stroke-black w-5 h-5"
        >
          <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z" />
        </svg>
      </button>

      {activeSearch.length > 0 && (
        <div className="absolute top-full mt-1 w-full rounded-xl border border-slate-500 bg-[#ECEFF0] z-50 overflow-hidden">
          <div
            className="max-h-70 overflow-y-auto p-3 flex flex-col gap-2
      [&::-webkit-scrollbar]:w-1
      [&::-webkit-scrollbar-track]:rounded-full
      [&::-webkit-scrollbar-track]:bg-gray-100
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-gray-300
      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
          >
            {activeSearch.map((item, index) => (
              <span
                key={index}
                onClick={() => {
                  setSearchId(item.id);
                  setSearchValue(item.name);
                  setActiveSearch([]);
                }}
                className={`cursor-pointer py-2 px-1 hover:bg-gray-200 rounded ${
                  index !== activeSearch.length - 1 &&
                  "border-b border-slate-400"
                }`}
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
