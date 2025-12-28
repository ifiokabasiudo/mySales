"use client";

import { useState, useEffect } from "react";
import AddItemModal from "@/app/inventory/components/addItemModal";
import SalesAddModal from "@/app/dashboard/addSale/quick-sale/components/salesAddModal";
import InventorySalesAddModal from "@/app/dashboard/addSale/inventory-sale/components/inventorySalesAddModal";
import { offlineInsert } from "@/lib/offline";
import { getSession } from "@/lib/session";
import useOfflineSync from "@/hooks/useOfflineSync";
import RestockModal from "@/app/inventory/components/restock-modal";
import AddExpenseModal from "@/app/table/expenses/components/addExpenseModal";
import { db } from "@/lib/db";

export default function TableNavbar({
  header,
  addItem,
  download,
}: {
  header?: string;
  addItem?: boolean;
  download?: string;
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isRestockOpen, setRestockOpen] = useState(false);

  const { manualSync } = useOfflineSync();

  // useEffect(() => {
  //   const test = async () => {
  //     await backfillInventoryBatches();
  //     await manualSync();
  //   };
  //   test();
  // }, []);

  // async function backfillInventoryBatches() {
  //   const allBatches = await db.inventory_batches.toArray();
  //   const pending = await db.pending_sync
  //     .where("table")
  //     .equals("inventory_batches")
  //     .toArray();

  //   const pendingIds = new Set(pending.map((p) => p.payload?.id));
  //   const missing = allBatches.filter((b) => !pendingIds.has(b.id));

  //   const now = new Date().toISOString();

  //   await db.transaction("rw", db.pending_sync, async () => {
  //     for (const batch of missing) {
  //       await db.pending_sync.add({
  //         table: "inventory_batches",
  //         action: "insert", // or "update" if you prefer
  //         payload: batch,
  //         created_at: now,
  //         tries: 0,
  //       });
  //     }
  //   });

  //   console.log(`Backfilled ${missing.length} inventory_batches for sync`);
  // }

  // useEffect(() => {
  //   const deleteTable = async () => {
  //     await db.delete(); // Dexie
  //     location.reload();
  //   };

  //   deleteTable()
  // }, []);

  const handleAddItem = async (
    item:
      | {
          name: string;
          stock_quantity: number;
          unit_price: number;
        }
      | any
  ) => {
    console.log("New item:", item);
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

    if (header === "Inventory") {
      await offlineInsert("inventory_items", {
        id: crypto.randomUUID(), // needed so Dexie + Supabase share same ID
        phone: data.profile.phone,
        // auth_user_id: null,
        // item_code: "ITEM-0200",
        name: item.name,
        unit_price: item.unit_price,
        stock_quantity: item.stock_quantity,
        // created_at: formatDate(new Date()),
      });
    }

    if (header === "Quick Sales") {
      await offlineInsert("quick_sales", {
        id: crypto.randomUUID(), // needed so Dexie + Supabase share same ID
        phone: data.profile.phone,
        // auth_user_id: null,
        // item_code: "ITEM-0200",
        total_amount: item.total_amount,
        note: item.note,
        mode: item.mode,
        status: "pending",
        reconciled_amount: 0,
        // created_at: formatDate(new Date()),
      });
    }

    console.log("Inventory sales items: ", item);

    if (header === "Inventory Sales") {
      await offlineInsert("inventory_sales", {
        id: crypto.randomUUID(),
        client_sale_id: crypto.randomUUID(),
        phone: data.profile.phone,
        item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        selling_price: item.selling_price,
        payment_type: item.payment_type,
        // created_at: formatDate(new Date()),
      });
    }

    await manualSync();

    alert("Item was saved offline, would sync when online!");
  };

  const handleRestock = async (item: {
    id: string;
    name: string;
    stock_quantity: number;
    unit_price: number;
  }) => {
    console.log("New item:", item);
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

    await offlineInsert("inventory_batches", {
      id: crypto.randomUUID(),
      item_id: item.id, // needed so Dexie + Supabase share same ID
      phone: data.profile.phone,
      // auth_user_id: null,
      // item_code: "ITEM-0200",
      // name: item.name,
      unit_cost: item.unit_price,
      quantity: item.stock_quantity,
      // created_at: formatDate(new Date()),
    });

    await manualSync();

    alert("Item was saved offline, would sync when online!");
  };

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold">{header}</h1>
      <div className="flex justify-between text-md gap-4">
        {addItem && header === "Inventory" && (
          <button
            onClick={() => setRestockOpen(true)}
            className="bg-white text-black px-3 text-sm rounded-full shadow-xl hover:bg-gray-300 hover:cursor-pointer"
          >
            Restock
          </button>
        )}
        {addItem && (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-white text-black px-3 text-sm rounded-full shadow-xl hover:bg-gray-300 hover:cursor-pointer"
          >
            <span className="text-[#1C8220]">+</span> Add Item
          </button>
        )}
        <button className="flex flex-col text-[10px] items-center hover:cursor-pointer">
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
          >
            <path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z" />
          </svg>
          <span>Download</span>
        </button>
      </div>
      {addItem && header === "Inventory" && (
        <AddItemModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleAddItem}
        />
      )}
      {addItem && header === "Inventory" && (
        <RestockModal
          isOpen={isRestockOpen}
          onClose={() => setRestockOpen(false)}
          onAdd={handleRestock}
        />
      )}
      {addItem && header === "Quick Sales" && (
        <SalesAddModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleAddItem}
        />
      )}
      {addItem && header === "Inventory Sales" && (
        <InventorySalesAddModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleAddItem}
        />
      )}
      {addItem && header === "Expenses" && (
        <AddExpenseModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          // onAdd={handleAddItem}
        />
      )}
    </div>
  );
}
