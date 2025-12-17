import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.toString();

  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/orders?${query}`;
  console.log("backendUrl",backendUrl)
  const res = await fetch(backendUrl, {
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data);
}
