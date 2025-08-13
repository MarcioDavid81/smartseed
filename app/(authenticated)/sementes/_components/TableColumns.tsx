"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Cultivar } from "@/types";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditCultivarButton from "./EditCultivarButton";

export const columnsProducts: ColumnDef<Cultivar>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="text-left px-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "product",
    header: "Produto",
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <div className="flex items-center gap-x-2">
          <EditCultivarButton cultivar={product} onUpdated={() => {}} />
        </div>
      );
    },
  },
];