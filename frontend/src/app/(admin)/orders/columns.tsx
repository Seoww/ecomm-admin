"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type DataResponse = {
    data: Order[];
    pagination: {
        count: number;
        limit: number;
        offset: number;
        total: number;
    }
}

export type Order = {
    items: OrderItems[];
    order_id: number
    total: number
    status: string
    user: {
        email: string;
        name: string;    
        user_id: number;
    }
}

export type OrderItems = {
    order_item_id: number;
    qty: number;
    unit_price: number;
    product: {
        product_id: number;
        title: string;
        sku: string;
    }
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "order_id",
    header: "Order ID",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "customer_name",
    accessorFn: (row) => `${row.user.name}`,
    header: "Customer Name",
  },
//   {
//     accessorKey: "email",
//     header: ({ column }) => {
//       return (
//         <Button
//           variant="ghost"
//           onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//         >
//           Email
//           <ArrowUpDown className="ml-2 h-4 w-4" />
//         </Button>
//       )
//     },
//   },
  {
    accessorKey: "total",
    header: "Total",
  },
]