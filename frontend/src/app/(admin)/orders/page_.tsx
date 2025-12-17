// src/app/(admin)/orders/page.tsx
import DataTable from "./table/data-table";

async function getOrders(params: Record<string, string | undefined>) {
//   const searchParams = new URLSearchParams(params as any);
//   console.log("search Params", params)
// return 
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/orders`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch orders");
  
  console.log(res)
  return res.json();
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: string;
    limit?: string;
    offset?: string;
    sort?: string;
    order?: string;
  };
}) {
  const data = await getOrders(searchParams);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
        {/* <pre>
            {data.data}
        </pre> */}
      {/* <DataTable
        data={data.data}
        pagination={data.pagination}
        searchParams={searchParams}
      /> */}
    </div>
  );
}