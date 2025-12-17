"use client";

import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type DataResponse = {
  data: Order[];
  pagination: {
    count: number;
    limit: number;
    offset: number;
    total: number;
  };
};

export type Order = {
  items: OrderItems[];
  order_id: number;
  total: number;
  status: string;
  user: {
    email: string;
    name: string;
    user_id: number;
  };
};

export type OrderItems = {
  order_item_id: number;
  qty: number;
  unit_price: number;
  product: {
    product_id: number;
    title: string;
    sku: string;
  };
};

export type SortMeta = {
  currentSort: string;
  currentOrder: "asc" | "desc";
};

const SortableHeader = <TData,>({
  header,
  label,
}: {
  header: HeaderContext<TData, unknown>;
  label: string;
}) => {
  const table = header.table;
  const column = header.column;

  const meta = table.options.meta as SortMeta | undefined;

  const isActive = meta?.currentSort === column.id;
  const order = meta?.currentOrder;

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
    enableSorting: true,
    header: (ctx) => (
      <SortableHeader header={ctx} label="Order ID" />
    ),
  },
  {
    accessorKey: "status",
    enableSorting: true,
    header: (ctx) => (
      <SortableHeader header={ctx} label="Status" />
    ),
  },
  {
    id: "customer_name",
    enableSorting: true,
    accessorFn: (row) => row.user.name,
    header: (ctx) => (
      <SortableHeader header={ctx} label="Customer Name" />
    ),
  },
  {
    accessorKey: "total",
    enableSorting: true,
    header: (ctx) => (
      <SortableHeader header={ctx} label="Total" />
    ),
  },
];
