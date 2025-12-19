"use client";

import { NonReconciledSales } from "../constants/non-reconciled-sales";
import { useState } from "react";
import ReconciliationModal from "./reconciliation-modal";
import ReverseReconciliationModal from "./reverse-reconciliation-modal";

type Sale = {
  id: string;
  total_amount: number;
  status: "pending" | "partial" | "completed";
  note: string | null;
  reconciled_amount: number;
  soft_deleted: boolean | undefined;
} | null;

export default function PendingReconciliationCards() {
  const [selectedSale, setSelectedSale] = useState<Sale>(null);
  const [open, setOpen] = useState(false);
  const [reverseReconciliationOpen, setReverseReconciliationOpen] =
    useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const sales = NonReconciledSales();
  return (
    <div className="flex flex-col gap-3 w-full bg-white rounded-xl h-[calc(100vh-20px)] p-4">
      {sales.map((sale) => (
        <div
          key={sale.id}
          className="flex flex-col w-full bg-[#C0DFC1] rounded-lg p-4 text-[#3C3A3A]"
        >
          <div className="flex justify-between">
            <h1 className="text-black text-2xl font-bold">
              ₦{sale.total_amount - sale.reconciled_amount}
            </h1>
            <p>{sale.status}</p>
          </div>
          <div className="flex justify-between">
            <p className="max-w-60">{sale?.note}</p>
            <button
              className="rounded-full px-4 py-1 bg-white hover:cursor-pointer"
              onClick={() => {
                setSelectedSale(sale);
                setOpen(true);
              }}
            >
              Allocate
            </button>
          </div>
          {sale.status !== "pending" && (
            <button
              className="rounded-md px-4 py-1 mt-2 bg-white hover:cursor-pointer"
              onClick={() => {
                setSelectedSaleId(sale.id);
                setReverseReconciliationOpen(true);
              }}
            >
              Reverse Allocation &gt;
            </button>
          )}
        </div>
      ))}
      <ReconciliationModal
        isOpen={open}
        onClose={() => setOpen(false)}
        sale={selectedSale}
      />
      {selectedSaleId && (
        <ReverseReconciliationModal
          // isOpen={reverseReconciliationOpen}
          // setReverseReconciliationOpen(false)
          onClose={() => {
            setSelectedSaleId(null);
          }}
          quickSaleId={selectedSaleId}
        />
      )}
    </div>
  );
}
