"use client";

import { ColumnDef } from "@tanstack/react-table";

export type UserResp = {
  data : User[],
  pagination: {
    count: number;
    limit: number;
    offset: number;
  }
}

export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "created_at",
    header: "Created",
  },
];
