"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Farm } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { AgroLoader } from "@/components/agro-loader";
import { useFarms } from "@/queries/registrations/use-farm";
import EditFarmButton from "./EditFarmButton";
import DeleteFarmButton from "./DeleteFarmButton";
import { FarmsDataTable } from "./FarmDataTable";

export function ListFarmsTable() {

  const {
      data: farms = [],
      isLoading,
      isFetching,
      refetch,
    } = useFarms();

  const columns: ColumnDef<Farm>[] = [
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
      cell: ({ row: { original } }) => original.name,
    },
    {
      accessorKey: "area",
      header: "Área (ha)",
      accessorFn: (row) => row.area,
      cell: ({ row: { original } }) => new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(original.area),
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const talhao = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <EditFarmButton farm={talhao} />
            <DeleteFarmButton farm={talhao} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Fazendas</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <FarmsDataTable columns={columns} data={farms} />
      )}
    </Card>
  );
}
