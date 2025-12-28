import Navbar from "@/components/navbar";
import TableNavbar from "@/components/table-navbar";
import ExpensesTable from "@/app/payment-table-test/expensesTable";

export default function ExpenseTable() {
    return (
        <div className="flex flex-col bg-[#ECEFF0] min-h-screen tracking-wider px-4">
            <Navbar />
            <TableNavbar header={"Expenses"} addItem={true}/>
            <ExpensesTable />
        </div>
    );
}