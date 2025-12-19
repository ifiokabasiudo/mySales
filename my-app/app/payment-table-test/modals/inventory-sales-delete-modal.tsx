import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InventorySales } from "../inventorySalesColumns";
import { offlineSoftDelete } from "@/lib/offline";
import useOfflineSync from "@/hooks/useOfflineSync";

export default function DeleteModal({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: InventorySales;
}) {
  const { manualSync } = useOfflineSync();

  async function handleDelete() {
    console.log("Deleted ID:", data.id);

    await offlineSoftDelete("inventory_sales", data.id, "User deleted");
    // await manualSync();
    await new Promise((res) => setTimeout(res, 0));

    await manualSync();
    // setTimeout(() => {
    // }, 50);

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Item</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{data.name}</span>? This action cannot
          be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            className="hover:cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            className="bg-rose-600 hover:cursor-pointer"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
