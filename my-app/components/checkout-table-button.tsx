import { useRouter } from "next/navigation";
import { TableData } from "@/app/dashboard/addSale/components/newSale";

export default function CheckOutTableButton (table: TableData | undefined) {
  const router = useRouter();

    return (
        <button
              onClick={() => {
                table && router.push(table?.link);
              }}
              className="text-white bg-green-700 rounded-md py-2 w-full hover:cursor-pointer"
            >
              Go To Table
            </button>
    )
}