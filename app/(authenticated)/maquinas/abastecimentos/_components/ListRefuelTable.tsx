"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Refuel } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { AgroLoader } from "@/components/agro-loader";
import { useUser } from "@/contexts/UserContext";
import { canUser } from "@/lib/permissions/canUser";
import { LoadingData } from "@/components/loading-data";
import { useRefuels } from "@/queries/machines/use-refuel-query";
import EditRefuelButton from "./EditRefuelButton";
import DeleteRefuelButton from "./DeleteRefuelButton";
import { RefuelDataTable } from "./RefuelDataTable";

export function ListRefuelTable() {
  const { user } = useUser();
  const canDelete = canUser(user?.role, "refuel:delete");

  const {
      data: refuels = [],
      isLoading,
      isFetching,
      refetch,
    } = useRefuels();

  const columns: ColumnDef<Refuel>[] = [
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
      id: "tank",
      header: () => <div className="text-left">Tanque de Combustível</div>,
      accessorFn: (row) => row.tank?.name ?? "",
      filterFn: "includesString",
      cell: ({ row }) => {
        const fuelTank = row.original.tank;

        if ((row.original as any)._optimistic) {
          return <LoadingData />;
        }

        if (!fuelTank) {
          return (
            <span className="text-muted-foreground italic text-sm">
              Sem tanque de combustível
            </span>
          );
        }

        return <span>{fuelTank.name}</span>;
      },
    },
    {
      id: "machine",
      header: () => <div className="text-left">Máquina</div>,
      accessorFn: (row) => row.machine?.name ?? "",
      filterFn: "includesString",
      cell: ({ row }) => {
        const machine = row.original.machine;

        if ((row.original as any)._optimistic) {
          return <LoadingData />;
        }

        if (!machine) {
          return (
            <span className="text-muted-foreground italic text-sm">
              Sem máquina
            </span>
          );
        }

        return <span>{machine.name}</span>;
      },
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-left">Quantidade (lt)</div>,
      cell: ({ row }) => {
        const quantity = row.original.quantity;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(quantity)}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const abastecimento = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <EditRefuelButton abastecimento={abastecimento} />
            <DeleteRefuelButton abastecimento={abastecimento} disabled={!canDelete} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Abastecimentos</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <RefuelDataTable columns={columns} data={refuels} />
      )}
    </Card>
  );
}
