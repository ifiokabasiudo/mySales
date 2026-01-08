"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import RowActionsInventorySale from "./rowActions/rowActionsInventorySale";
import { formatDate } from "@/lib/isoToNormalDate";
import { getInvSaleNumber } from "@/lib/idGenerator";

export type InventorySales = {
  id: string;
  item_id: string;
  phone: string | undefined;
  name: string;
  quantity: number;
  selling_price: number;
  total_amount: number;
  payment_type: string;
  soft_deleted: boolean | undefined;
  updated_at: string | undefined;
};

export const inventorySalesColumns: ColumnDef<InventorySales>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;

      return <RowActionsInventorySale data={data} />;
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
      );
    },
    cell: ({ row }) => {
      const id: any = row.getValue("id");
      const date: any = row.getValue("updated_at");
      return <div className="font-medium">{getInvSaleNumber(id, date)}</div>;
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
      );
    },
  },
  {
    accessorKey: "quantity",
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
      );
    },
    filterFn: (row, columnId, value) =>
      String(row.getValue(columnId)).includes(value),
  },
  {
    accessorKey: "selling_price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Selling Price
          <div className="hover:cursor-pointer"><ArrowUpDown className="ml-2 h-4 w-4" /></div>
        </Button>
      );
    },
    filterFn: (row, columnId, value) =>
      String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const selling_price = parseFloat(row.getValue("selling_price"));
      const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(selling_price);

      return <div className="text-right font-medium">{formatted}</div>;
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
          <div className="hover:cursor-pointer"><ArrowUpDown className="ml-2 h-4 w-4" /></div>
        </Button>
      );
    },
    filterFn: (row, columnId, value) =>
      String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const total_amount = parseFloat(row.getValue("total_amount"));
      const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(total_amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "payment_type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mode of Payment
          <div className="hover:cursor-pointer"><ArrowUpDown className="ml-2 h-4 w-4" /></div>
        </Button>
      );
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
      );
    },
    filterFn: (row, columnId, value) =>
      String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const updated_at: any = row.getValue("updated_at");
      return (
        <div className="text-right font-medium">{formatDate(updated_at)}</div>
      );
    },
  },
];
