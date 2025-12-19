import Navbar from "@/components/navbar"
import TableNavbar from "@/components/table-navbar"
import PendingReconciliationCards from "./components/pending-reconciliation-cards"

export default function Reconciliation () {
    return (
        <div className="flex flex-col bg-[#ECEFF0] min-h-screen tracking-wider px-4">
            <Navbar />
            <TableNavbar header="Allocation" addItem={false} />
            <p className="text-[#3C3A3A] text-sm mb-3">Allocate the sales you didn’t dedicate an item to. So that they can be deducted from the inventory</p>
            <PendingReconciliationCards />
        </div>
    )
}