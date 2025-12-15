"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { FuelTank } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { AgroLoader } from "@/components/agro-loader";
import { useUser } from "@/contexts/UserContext";
import { canUser } from "@/lib/permissions/canUser";
import { useFuelTank } from "@/queries/machines/use-fuelTank-query";
import EditFuelTankButton from "./EditFuelTankButton";
import DeleteFuelTankButton from "./DeleteFuelTankButton";
import { FuelTankDataTable } from "./FuelTankDataTable";

export function ListFuelTankDataTable() {
  const { user } = useUser();
  const canDelete = canUser(user.role, "fuelTank:delete");

  const {
    data: fuelTanks = [],
    isLoading,
    isFetching,
    refetch,
  } = useFuelTank();

  const columns: ColumnDef<FuelTank>[] = [
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
      filterFn: "includesString",
      cell: ({ row: { original } }) => original.name,
    },
    {
      id: "capacity",
      header: () => <div className="text-left">Capacidade (L)</div>,
      accessorFn: (row) => row.capacity ?? "",
      filterFn: "includesString",
      cell: ({ row: { original } }) => {
        const capacity = original.capacity;
        return (
          <div className="text-left">
            {capacity ? new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(capacity) : 0}
          </div>
        );
      },
    },
    {
      accessorKey: "stock",
      header: () => <div className="text-center">Estoque (L)</div>,
      cell: ({ row: { original } }) => {
        const stock = original.stock;
        return (
          <div className="text-center">
            {stock ? new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(stock) : 0}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const machine = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <EditFuelTankButton fuelTank={machine} />
            <DeleteFuelTankButton fuelTank={machine} disabled={!canDelete} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Tanques de Combustível</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <FuelTankDataTable columns={columns} data={fuelTanks} />
      )}
    </Card>
  );
}
