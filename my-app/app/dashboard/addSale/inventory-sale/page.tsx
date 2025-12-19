import Navbar from "@/components/navbar";
import TableNavbar from "@/components/table-navbar";
import InventorySalesTable from "@/app/payment-table-test/inventorySalesTable";

export default function InventorySales() {
    return (
        <div className="flex flex-col bg-[#ECEFF0] min-h-screen tracking-wider">
            <Navbar />
            <TableNavbar header={"Inventory Sales"} addItem={true}/>
            <InventorySalesTable />
        </div>
    );
}