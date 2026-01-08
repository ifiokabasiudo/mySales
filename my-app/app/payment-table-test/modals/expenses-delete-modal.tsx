import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Expenses } from "../expensesColumns";
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
  data: Expenses;
}) {
  const { manualSync } = useOfflineSync();
  const { run, isLoading } = useSafeAction();

  async function handleDelete() {
    await run(
      async () => {
        console.log("Deleted ID:", data.id);

        await offlineSoftDelete("expenses", data.id, "User deleted");

        await manualSync();

        setOpen(false);
      },
      { loading: "Deleting...", success: "Successfully deleted" }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Expense</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{data.category}</span>? This action
          cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            disabled={isLoading}
            variant="outline"
            className={`hover:cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            disabled={isLoading}
            variant="destructive"
            className={`bg-rose-600 hover:cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
            onClick={handleDelete}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
