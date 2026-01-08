"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import RowActions from "./rowActions/rowActionsInventoryItems"
import { formatDate } from "@/lib/isoToNormalDate"; 
import { getItemNumber } from "@/lib/idGenerator"

export type InventoryItems = {
  id: string
  name: string
  stock_quantity: number
  unit_price: number
  updated_at: string | undefined
  soft_deleted: boolean | undefined
}

export const columns: ColumnDef<InventoryItems>[] = [
{
    id: "actions",
    cell: ({ row }) => {
      const data = row.original

      return (
        <RowActions data={data}/>
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
          <div className="hover:cursor-pointer"><ArrowUpDown className="ml-2 h-4 w-4" /></div>
        </Button>
      )
    },
    cell: ({ row }) => {
      const id: any = row.getValue("id")
      const date: any = row.getValue("updated_at")
      return <div className="font-medium">{getItemNumber(id, date)}</div>
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Item Name
          <div className="hover:cursor-pointer"><ArrowUpDown className="ml-2 h-4 w-4" /></div>
        </Button>
      )
    },
  },
  {
    accessorKey: "stock_quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <div className="hover:cursor-pointer"><ArrowUpDown className="ml-2 h-4 w-4" /></div>
        </Button>
      )
    },
    filterFn: (row, columnId, value) =>
    String(row.getValue(columnId)).includes(value),
  },
  {
    accessorKey: "unit_price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="flex justify-end w-full px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Unit Price
          <div className="hover:cursor-pointer"><ArrowUpDown className="ml-2 h-4 w-4" /></div>
        </Button>
      )
    },
    // header: () => <div >Unit Price</div>,
    filterFn: (row, columnId, value) =>
    String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const unit_price = parseFloat(row.getValue("unit_price"))
      const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(unit_price)

      return <div className="text-right font-medium">{formatted}</div>
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
          <div className="hover:cursor-pointer"><ArrowUpDown className="ml-2 h-4 w-4" /></div>
        </Button>
      )
    },
    filterFn: (row, columnId, value) =>
    String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const updated_at: any = row.getValue("updated_at")
      return <div className="text-right font-medium">{formatDate(updated_at)}</div>
    },
  },
]