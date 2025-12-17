"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return v;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  total: number;
  loading?: boolean;
  limit: number;
  offset: number;
  search: string;
  onSearch: (value: string) => void;
  onPageChange: (offset: number) => void;
}

export function DataTable<TData>({
  columns,
  data,
  total,
  loading,
  limit,
  offset,
  search,
  onSearch,
  onPageChange,
}: DataTableProps<TData>) {
  const [searchInput, setSearchInput] = React.useState(search);
  const debouncedSearch = useDebounced(searchInput);

  React.useEffect(() => {
    onSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const pageIndex = Math.floor(offset / limit);
  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="rounded-md border">
      <div className="p-4">
        <Input
          placeholder="Search orders..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
            {loading ? (
                <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6">
                    Loading…
                </TableCell>
                </TableRow>
            ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                <TableCell colSpan={columns.length} className="text-center py-6">
                    No results
                </TableCell>
                </TableRow>
            )}
        </TableBody>

      </Table>

      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-muted-foreground">
          {offset + 1}–
          {Math.min(offset + limit, total)} of {total}
        </span>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex === 0}
            onClick={() => onPageChange((pageIndex - 1) * limit)}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex + 1 >= pageCount}
            onClick={() => onPageChange((pageIndex + 1) * limit)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
