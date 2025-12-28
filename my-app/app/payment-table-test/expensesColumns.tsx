"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import RowActionsExpenses from "./rowActions/rowActionsExpenses";

export type Expenses = {
  id: string;
  // item_id: string;
  phone: string | undefined;
  category: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  amount: number | null;
  type: string;
  // payment_type: string;
  soft_deleted: boolean | undefined;
  updated_at: string | undefined;
};

function formatCurrency(value: unknown) {
  if (value === null || value === undefined) {
    return "—"; // clean dash
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return "—";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(num);
}

function formatQuantity(value: unknown) {
  if (value === null || value === undefined) {
    return "—";
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return "—";
  }

  return num;
}

export const expensesColumns: ColumnDef<Expenses>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;
      const type = data.type;

      return type != "cogs" && <RowActionsExpenses data={data} />;
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
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: (row, columnId, value) =>
      String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      // const formatted = new Intl.NumberFormat("en-NG", {
      //   style: "currency",
      //   currency: "NGN",
      // }).format(amount)

      return (
        <div className="text-right font-medium">{formatCurrency(amount)}</div>
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: (row, columnId, value) =>
      String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const value = row.getValue("quantity");
      return (
        <div className="font-medium">{formatQuantity(value)}</div>
      );
    },
  },
  {
    accessorKey: "unit_cost",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Unit Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: (row, columnId, value) =>
      String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const unit_cost = parseFloat(row.getValue("unit_cost"));
      // const formatted = new Intl.NumberFormat("en-NG", {
      //   style: "currency",
      //   currency: "NGN",
      // }).format(unit_cost)

      return (
        <div className="text-right font-medium">
          {formatCurrency(unit_cost)}
        </div>
      );
    },
  },
  {
    accessorKey: "total_cost",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: (row, columnId, value) =>
      String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const total_cost = parseFloat(row.getValue("total_cost"));
      // const formatted = new Intl.NumberFormat("en-NG", {
      //   style: "currency",
      //   currency: "NGN",
      // }).format(total_cost)

      return (
        <div className="text-right font-medium">
          {formatCurrency(total_cost)}
        </div>
      );
    },
  },
  // {
  //   accessorKey: "payment_type",
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         className="px-0"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       >
  //         Mode of Payment
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     )
  //   },
  // },
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
      );
    },
    filterFn: (row, columnId, value) =>
      String(row.getValue(columnId)).includes(value),
    cell: ({ row }) => {
      const updated_at: any = row.getValue("updated_at");
      return <div className="text-right font-medium">{updated_at}</div>;
    },
  },
];
