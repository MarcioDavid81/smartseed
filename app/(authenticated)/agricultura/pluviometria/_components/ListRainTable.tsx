"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Rain } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { AgroLoader } from "@/components/agro-loader";
import { LoadingData } from "@/components/loading-data";
import { useRains } from "@/queries/industry/use-rain";
import EditRainButton from "./EditRainButton";
import DeleteRainButton from "./DeleteRainButton";
import { RainsDataTable } from "./RainsDataTable";

export function ListRainsTable() {

  const {
      data: chuvas = [],
      isLoading,
      isFetching,
      refetch,
    } = useRains();

  const columns: ColumnDef<Rain>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row: { original } }) => new Date(original.date).toLocaleDateString("pt-BR"),
    },
    {
      id: "farm",
      header: "Fazenda",
      accessorFn: (row) => row.farm?.name ?? "",
      filterFn: "includesString",
      cell: ({ row: { original } }) => <div>{original.farm?.name ? (original.farm.name) : <LoadingData />}</div>,
    },
    {
      accessorKey: "quantity",
      header: "Quantidade (mm)",
      accessorFn: (row) => row.quantity,
      cell: ({ row: { original } }) => new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(original.quantity),
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const chuva = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <EditRainButton chuva={chuva} />
            <DeleteRainButton chuva={chuva} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Chuvas</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <RainsDataTable columns={columns} data={chuvas} sumColumnId="quantity" />
      )}
    </Card>
  );
}
