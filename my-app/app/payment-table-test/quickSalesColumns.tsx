"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import RowActionsQuickSale from "./rowActions/rowActionsQuickSale"

export type QuickSales = {
    id: string;
    phone: string | undefined;
    reconciled_amount: number;
    status: "pending" | "partial" | "completed";
    note: string | null;
    mode: string;
    soft_deleted: boolean | undefined;
    total_amount: number;
    updated_at: string | undefined;
}

export const quickSalesColumns: ColumnDef<QuickSales>[] = [
{
    id: "actions",
    cell: ({ row }) => {
      const data = row.original

      return (
        <RowActionsQuickSale data={data}/>
      )
    },
  },
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    filterFn: (row, columnId, value) =>
    String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const total_amount = parseFloat(row.getValue("total_amount"))
      const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(total_amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "reconciled_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="flex justify-end w-full px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Allocated Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    // header: () => <div >Unit Price</div>,
    filterFn: (row, columnId, value) =>
    String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const reconciled_amount = parseFloat(row.getValue("reconciled_amount"))
      const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(reconciled_amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "note",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Side Note
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "mode",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mode of Transfer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "updated_at",
    // header: () => <div className="text-right">Transaction updated_at</div>,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="flex justify-end w-full px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    filterFn: (row, columnId, value) =>
    String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const updated_at: any = row.getValue("updated_at")
      return <div className="text-right font-medium">{updated_at}</div>
    },
  },
]