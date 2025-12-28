import Navbar from "@/components/navbar";
import TableNavbar from "@/components/table-navbar";
import QuickSalesTable from "@/app/payment-table-test/quickSalesTable";

export default function Inventory() {
    return (
        <div className="flex flex-col bg-[#ECEFF0] min-h-screen tracking-wider px-4">
            <Navbar />
            <TableNavbar header={"Quick Sales"} addItem={true}/>
            <QuickSalesTable />
        </div>
    );
}