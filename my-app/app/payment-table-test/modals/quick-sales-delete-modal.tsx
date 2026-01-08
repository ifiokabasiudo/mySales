import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuickSales } from "../quickSalesColumns";
import { offlineSoftDelete } from "@/lib/offline";
import useOfflineSync from "@/hooks/useOfflineSync";
import { useSafeAction } from "@/hooks/useSafeAction";

export default function DeleteModal({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: QuickSales;
}) {
  const { manualSync } = useOfflineSync();
  const { run, isLoading } = useSafeAction();

  async function handleDelete() {
    // console.log("Deleted ID:", data.id);
    await run(
      async () => {
        await offlineSoftDelete("quick_sales", data.id, "User deleted"); //soft deleted, deleted_at
        // await manualSync();
        // await new Promise((res) => setTimeout(res, 0));

        await manualSync();
      },
      { loading: "Deleting...", success: "Deleted successfully" }
    );

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Sale</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this sale? This action cannot be
          undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            disabled={isLoading}
            variant="outline"
            className="hover:cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            disabled={isLoading}
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
