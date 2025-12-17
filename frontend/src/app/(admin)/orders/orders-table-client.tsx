"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { columns, OrdersResponse } from "./columns";
import { DataTable } from "./data-table";

const getParam = (sp: URLSearchParams, key: string) =>
  sp.get(key) ?? undefined;

export default function OrdersTableClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const limit = Number(getParam(searchParams, "limit") ?? 50);
  const offset = Number(getParam(searchParams, "offset") ?? 0);
  const search = getParam(searchParams, "search") ?? "";

  const sort = getParam(searchParams, "sort") ?? "created_at";
  const order =
    (getParam(searchParams, "order") as "asc" | "desc") ?? "desc";

  const [data, setData] = React.useState<OrdersResponse | null>(null);
  const [loading, setLoading] = React.useState(false);

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);

    const qs = new URLSearchParams();

    if (search) qs.set("search", search);
    if (sort) qs.set("sort", sort);
    if (order) qs.set("order", order);

    qs.set("limit", String(limit));
    qs.set("offset", String(offset));

    const res = await fetch(`/api/orders?${qs.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      setLoading(false);
      throw new Error("Failed to fetch orders");
    }

    const json: OrdersResponse = await res.json();
    setData(json);
    setLoading(false);
  }, [search, sort, order, limit, offset]);

  const prevKeyRef = React.useRef("");

  React.useEffect(() => {
    const key = `${search}|${limit}|${offset}|${sort}|${order}`;

    if (prevKeyRef.current === key) return;
    prevKeyRef.current = key;

    fetchOrders();
  }, [search, limit, offset, sort, order, fetchOrders]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });

    router.replace(`${pathname}?${params.toString()}`);
  };

  if (!data) {
    return <div className="py-10 text-center">Loading…</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={data.data}
      total={data.pagination.total}
      loading={loading}
      limit={limit}
      offset={offset}
      search={search}
      sort={sort}
      order={order}
      onSearch={(v) =>
        updateParams({
          search: v || null,
          offset: "0",
        })
      }
      onPageChange={(nextOffset) =>
        updateParams({ offset: String(nextOffset) })
      }
      onSortChange={(nextSort, nextOrder) =>
        updateParams({
          sort: nextSort,
          order: nextOrder,
          offset: "0",
        })
      }
    />
  );
}
