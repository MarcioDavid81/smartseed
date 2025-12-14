"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Machine } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { AgroLoader } from "@/components/agro-loader";
import { useUser } from "@/contexts/UserContext";
import { canUser } from "@/lib/permissions/canUser";
import EditMachineButton from "./EditMachineButton";
import DeleteMachineButton from "./DeleteMachineButton";
import { MachineDataTable } from "./MachineDataTable";
import { getMachineTypeLabel } from "@/app/_helpers/getMachineLabel";
import { useMachines } from "@/queries/machines/use-machine-query";

export function ListMachineDataTable() {
  const { user } = useUser();
  const canDelete = canUser(user.role, "machine:delete");

  const {
    data: machines = [],
    isLoading,
    isFetching,
    refetch,
  } = useMachines();

  const columns: ColumnDef<Machine>[] = [
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
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row: { original } }) => getMachineTypeLabel(original.type),
    },
    {
      id: "brand",
      header: "Marca",
      accessorFn: (row) => row.brand ?? "",
      filterFn: "includesString",
      cell: ({ row: { original } }) => <div className="text-left">{original.brand}</div>,
    },
    {
      id: "model",
      header: "Modelo",
      accessorFn: (row) => row.model ?? "",
      filterFn: "includesString",
      cell: ({ row: { original } }) => <div className="text-left">{original.model}</div>,
    },
    {
      accessorKey: "hourmeter",
      header: () => <div className="text-left">Horímetro (h)</div>,
      cell: ({ row }) => {
        const hourmeter = row.original.hourmeter;
        return (
          <div className="text-left">
            {hourmeter ? new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(hourmeter) : 0}
          </div>
        );
      },
    },
    {
      id: "odometer",
      header: () => <div className="text-left">Quilometragem (km)</div>,
      accessorFn: (row) => row.odometer ?? "",
      filterFn: "includesString",
      cell: ({ row: { original } }) => {
        const odometer = original.odometer;
        return (
          <div className="text-left">
            {odometer ? new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(odometer) : 0}
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
            <EditMachineButton machine={machine} />
            <DeleteMachineButton machine={machine} disabled={!canDelete} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Máquinas</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <MachineDataTable columns={columns} data={machines} />
      )}
    </Card>
  );
}
