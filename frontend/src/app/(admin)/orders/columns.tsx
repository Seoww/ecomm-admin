"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { Order } from "./columns"; // adjust import if needed

const SortableHeader = ({
  column,
  label,
}: {
  column: any;
  label: string;
}) => {
  const { sort, order } = column.columnDef.meta || {};

  const isActive = sort === column.id;

  return (
    <Button
      variant="ghost"
      className="flex items-center gap-2 px-0"
      onClick={column.getToggleSortingHandler()}
    >
      {label}

      {!isActive ? (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      ) : order === "asc" ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      )}
    </Button>
  );
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "order_id",
    header: ({ column }) => (
      <SortableHeader column={column} label="Order ID" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column} label="Status" />
    ),
  },
  {
    id: "customer_name",
    accessorFn: (row) => row.user.name,
    header: ({ column }) => (
      <SortableHeader column={column} label="Customer Name" />
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <SortableHeader column={column} label="Total" />
    ),
    cell: ({ getValue }) => {
      const value = Number(getValue() ?? 0);
      return `RM ${value.toFixed(2)}`;
    },
  },
];
