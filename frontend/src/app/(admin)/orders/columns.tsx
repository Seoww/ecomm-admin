"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
export type OrdersResponse = {
  data: Order[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    count: number;
  };
};

export type Order = {
  order_id: number;
  status: string;
  total: number;
  created_at: string;

  user: {
    user_id: number;
    name: string;
    email: string;
  };

  items: OrderItem[];
};

export type OrderItem = {
  order_item_id: number;
  qty: number;
  unit_price: number;

  product: {
    product_id: number;
    title: string;
    sku: string;
  };
};

const SortableHeader = ({
  table,
  label,
}: {
  table: any;
  label: string;
}) => {
  const header = table.header
  const meta = header.getContext().table.options.meta as {
    currentSort?: string;
    currentOrder?: "asc" | "desc";
  };
  console.log("meta",meta)
  console.log("table",table)

  const isActive = meta?.currentSort === header.column.id;
  const order = meta?.currentOrder;

  return (
    <Button
      variant="ghost"
      className="flex items-center gap-2 px-0"
      onClick={header.column.getToggleSortingHandler()}
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
    header: (ctx) => (
      <SortableHeader table={ctx} label="Order ID" />
    ),
  },
  {
    accessorKey: "status",
    header: (ctx) => (
      <SortableHeader table={ctx} label="Status" />
    ),
  },
  {
    id: "customer_name",
    accessorFn: (row) => row.user.name,
    header: (ctx) => (
      <SortableHeader table={ctx} label="Customer Name" />
    ),
  },
  {
    accessorKey: "total",
    header: (ctx) => (
      <SortableHeader table={ctx} label="Total" />
    ),
    cell: ({ getValue }) => {
      const value = Number(getValue() ?? 0);
      return `RM ${value.toFixed(2)}`;
    },
  },
];
