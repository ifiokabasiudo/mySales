"use client";

import * as React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";

import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters?: { id: string; name: string }[];
  extras: {
    initialFilter: string;
    initialPlaceholder: string;
    numericalCols: string[];
    monetaryCols: string[];
    nonMonetaryCols: string[];
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  extras,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectFilter, setSelectFilter] = useState(extras.initialFilter);
  const [placeholder, setPlaceholder] = useState(extras.initialPlaceholder);
  // console.log("Data: ", data)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  console.log("This is the table", table.getCoreRowModel().rows);

  const getColumnTotal = (columnId: string) => {
    return table.getCoreRowModel().rows.reduce((sum, row) => {
      const value = row.getValue(columnId);
      const number = Number(value);
      return sum + (isNaN(number) ? 0 : number);
    }, 0);
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-none" asChild>
            <Button variant="outline" className="ml-auto">
              Filter By
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white" align="end">
            {filters &&
              filters.map((filter) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={filter.id}
                    className="capitalize"
                    onCheckedChange={() => {
                      setSelectFilter(filter.id);
                      setPlaceholder(filter.name);
                      console.log("This is the filter: " + filter.id);
                    }}
                    checked={selectFilter === filter.id}
                    // onCheckedChange={(value) =>
                    //   column.toggleVisibility(!!value)
                    // }
                  >
                    {filter.name}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Input
          placeholder={`Filter ${placeholder}`}
          value={
            (table.getColumn(selectFilter)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(selectFilter)?.setFilterValue(event.target.value)
          }
          className="max-w-sm rounded-none"
        />
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-none" asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white" align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden border">
        <Table>
          <TableHeader className="bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id;
                  const isNumeric = extras.numericalCols.includes(columnId);
                  const isMoney = extras.monetaryCols.includes(columnId);
                  const isNotMoney = extras.nonMonetaryCols.includes(columnId);

                  return (
                    <TableHead
                      className={`text-white text-right ${
                        isNumeric && isMoney
                          ? "text-right"
                          : isNumeric && isNotMoney
                          ? "text-left"
                          : "text-left"
                      }`}
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableHeader className="bg-gray-600">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id;
                  const isNumeric = extras.numericalCols.includes(columnId);
                  const isMoney = extras.monetaryCols.includes(columnId);
                  const isNotMoney = extras.nonMonetaryCols.includes(columnId);

                  return (
                    <TableHead
                      key={header.id}
                      className={`text-white font-bold 
                        ${
                          isNumeric && isMoney
                            ? "text-right"
                            : isNumeric && isNotMoney
                            ? "text-left"
                            : "text-left"
                        }
                      `}
                    >
                      {header.isPlaceholder
                        ? null
                        : columnId === "id"
                        ? "TOTAL"
                        : isNotMoney
                        ? getColumnTotal(columnId)
                        : isMoney
                        ? new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                          }).format(getColumnTotal(columnId))
                        : ""}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
