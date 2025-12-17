"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
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
import { ChevronDown, ChevronRight } from "lucide-react";

function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return v;
}

interface DataTableProps<TData extends { items?: any[] }> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  total: number;
  loading?: boolean;

  limit: number;
  offset: number;

  search: string;
  onSearch: (value: string) => void;
  onPageChange: (offset: number) => void;

  sort: string;
  order: "asc" | "desc";
  onSortChange: (sort: string, order: "asc" | "desc") => void;
}

export function DataTable<TData extends { items?: any[] }>({
  columns,
  data,
  total,
  loading,
  limit,
  offset,
  search,
  onSearch,
  onPageChange,
  sort,
  order,
  onSortChange,
}: DataTableProps<TData>) {
  const [searchInput, setSearchInput] = React.useState(search);
  const debouncedSearch = useDebounced(searchInput);

  React.useEffect(() => {
    onSearch(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const [sorting, setSorting] = React.useState<SortingState>(() =>
    sort ? [{ id: sort, desc: order === "desc" }] : []
  );

  const handleSortingChange = (
    updater: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const next =
      typeof updater === "function" ? updater(sorting) : updater;

    setSorting(next);

    if (next.length) {
      onSortChange(next[0].id, next[0].desc ? "desc" : "asc");
    }
  };

  React.useEffect(() => {
    setSorting(sort ? [{ id: sort, desc: order === "desc" }] : []);
  }, [sort, order]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const pageIndex = Math.floor(offset / limit);
  const pageCount = Math.max(1, Math.ceil(total / limit));

  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  return (
    <div className="rounded-md border">
      <div className="p-4">
        <Input
          placeholder="Search orders or order ID…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              <TableHead className="w-10" />
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
              <TableCell colSpan={columns.length + 1} className="py-6 text-center">
                Loading…
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => {
              const isOpen = expanded[row.id];
              const items = (row.original as any).items ?? [];

              return (
                <React.Fragment key={row.id}>
                  <TableRow
                    onClick={() =>
                      setExpanded((p) => ({
                        ...p,
                        [row.id]: !isOpen,
                      }))
                    }
                  >
                    <TableCell className="w-10">
                      {items.length > 0 && (
                        <button
                          // onClick={() =>
                          //   setExpanded((p) => ({
                          //     ...p,
                          //     [row.id]: !isOpen,
                          //   }))
                          // }
                        >
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </TableCell>

                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>

                  {isOpen && (
                    <TableRow className="bg-muted/40">
                      <TableCell colSpan={columns.length + 1} className="p-4">
                        <div className="space-y-2">
                          {items.map((item: any) => (
                            <div
                              key={item.order_item_id}
                              className="flex justify-between text-sm border-b pb-2"
                            >
                              <div>
                                <div className="font-medium">
                                  {item.product.title}
                                </div>
                                <div className="text-muted-foreground">
                                  {item.product.sku}
                                </div>
                              </div>

                              <div className="text-right">
                                <div>Qty: {item.qty}</div>
                                <div>
                                  RM {item.unit_price.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="py-6 text-center">
                No results
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between p-4">
        <span className="text-sm text-muted-foreground">
          {offset + 1}–{Math.min(offset + limit, total)} of {total}
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
