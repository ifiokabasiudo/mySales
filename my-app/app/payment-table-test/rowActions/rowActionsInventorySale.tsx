import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import EditModal from "../modals/inventory-sales-edit-modal";
import DeleteModal from "../modals/inventory-sales-delete-modal";
import { InventorySales } from "../inventorySalesColumns";

export default function rowActionsInventorySale({ data }: { data: InventorySales; }) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="bg-white" align="end">
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-red-600"
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