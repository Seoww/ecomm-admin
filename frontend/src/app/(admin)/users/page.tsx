import { DataTable } from "./table/data-table";
import { columns, UserResp } from "./table/columns";

async function getUsers(): Promise<UserResp> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
  
  const res = await fetch(`${apiUrl}/api/users?order_by=id&order_dir=desc`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export default async function UsersPage() {
  const { data } = await getUsers();
  console.log("users", data)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
