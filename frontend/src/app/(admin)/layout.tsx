"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 border-r bg-background p-4
          transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="font-semibold mb-6">Admin</div>

        <nav className="space-y-2 text-sm">
          {/* <Link href="/users" className="block hover:underline">
            Users
          </Link>
          <Link href="/products" className="block hover:underline">
            Products
          </Link> */}
          <Link href="/orders" className="block hover:underline">
            Orders
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 border-b p-4">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md border px-3 py-1 text-sm"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="font-semibold">Admin</span>
        </header>

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Admin console
            </p>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
