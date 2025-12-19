import Navbar from "@/components/navbar";
import TableNavbar from "@/components/table-navbar";
import ClientInventoryTable from "../payment-table-test/clientInventoryTable";

export default function Inventory() {
    return (
        <div className="flex flex-col bg-[#ECEFF0] min-h-screen tracking-wider px-4">
            <Navbar />
            <TableNavbar header={"Inventory"} addItem={true}/>
            <ClientInventoryTable />
        </div>
    );
}