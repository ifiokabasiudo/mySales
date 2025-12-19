"use client"

import { useReconciliationDetails } from "../constants/reconciled-sales";
import { offlineSoftDelete } from "@/lib/offline";
import useOfflineSync from "@/hooks/useOfflineSync";

export default function ReverseReconciliationModal({
  quickSaleId,
  onClose,
}: {
  quickSaleId: string;
  onClose: () => void;
}) {
  const rows = useReconciliationDetails(quickSaleId);
  const { manualSync } = useOfflineSync()

  const handleReverse = async (reconciliationId: string, inventorySalesId: string) => {
    await offlineSoftDelete("reconciliation_links", reconciliationId, "User reversed reconciliation");
    await offlineSoftDelete("inventory_sales", inventorySalesId, "User reversed reconciliation");

    alert("Reverse successful")
    await manualSync()
  } 

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-5 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Reverse Items</h2>

        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.reconciliation_id}
              className="flex justify-between items-center bg-gray-100 rounded-lg p-3"
            >
              <div>
                <p className="font-semibold">{row.item_name}</p>
                <p className="text-sm text-gray-600">
                  {row.quantity} × ₦{row.selling_price}
                </p>
                <p className="text-sm font-bold">
                  ₦{row.total}
                </p>
              </div>

              <button
                className="text-red-600 border border-red-600 rounded-lg px-3 py-1 hover:cursor-pointer hover:text-white hover:bg-red-600 transition-colors duration-300"
                onClick={() => {
                  // call reverse logic here
                  handleReverse(row.reconciliation_id, row.inventory_sale_id)
                }}
              >
                Reverse
              </button>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="mt-4 w-full border rounded-lg py-2 hover:cursor-pointer">
          Close
        </button>
      </div>
    </div>
  );
}
