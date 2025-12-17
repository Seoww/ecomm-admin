"use client";

import OrdersTableClient from "./orders/orders-table-client";

export default function OrdersPage() {
  return (
    <div className="container mx-auto py-10">
      <OrdersTableClient />
    </div>
  );
}
