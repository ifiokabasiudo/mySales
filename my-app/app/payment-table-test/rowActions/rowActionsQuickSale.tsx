import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import EditModal from "../modals/quick-sales-edit-modal";
import DeleteModal from "../modals/quick-sales-delete-modal";
import { QuickSales } from "../quickSalesColumns";

export default function rowActionsQuickSale({ data }: { data: QuickSales; }) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="hover:cursor-pointer">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="bg-white" align="end">
          <DropdownMenuItem onClick={() => setOpenEdit(true)} className="hover:cursor-pointer">
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-red-600 hover:cursor-pointer"
            onClick={() => setOpenDelete(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* MODALS */}
      <EditModal open={openEdit} setOpen={setOpenEdit} data={data} />
      <DeleteModal open={openDelete} setOpen={setOpenDelete} data={data} />
    </>
  );
}
