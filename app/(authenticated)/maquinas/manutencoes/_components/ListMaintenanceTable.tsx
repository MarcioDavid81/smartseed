"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Maintenance } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { AgroLoader } from "@/components/agro-loader";
import { useUser } from "@/contexts/UserContext";
import { canUser } from "@/lib/permissions/canUser";
import { LoadingData } from "@/components/loading-data";
import { useMaintenance } from "@/queries/machines/use-maintenance-query";
import EditMaintenanceButton from "./EditMaintenanceButton";
import DeleteMaintenanceButton from "./DeleteMaintenanceButton";
import { MaintenanceDataTable } from "./MaintenanceDataTable";

export function ListMaintenanceTable() {
  const { user } = useUser();
  const canDelete = canUser(user?.role, "maintenance:delete");

  const {
      data: maintenances = [],
      isLoading,
      isFetching,
      refetch,
    } = useMaintenance();

  const columns: ColumnDef<Maintenance>[] = [
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
      id: "customer",
      header: () => <div className="text-left">Cliente</div>,
      accessorFn: (row) => row.customer?.name ?? "",
      filterFn: "includesString",
      cell: ({ row }) => {
        const customer = row.original.customer;

        if ((row.original as any)._optimistic) {
          return <LoadingData />;
        }

        if (!customer) {
          return (
            <span className="text-muted-foreground italic text-sm">
              Sem cliente
            </span>
          );
        }

        return <span>{customer.name}</span>;
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
      id: "totalValue",
      header: () => <div className="text-left">Valor Total (R$)</div>,
      accessorFn: (row) => row.totalValue,
      filterFn: "includesString",
      cell: ({ row }) => {
        const totalValue = row.original.totalValue;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(totalValue)}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const manutencao = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <EditMaintenanceButton manutencao={manutencao} />
            <DeleteMaintenanceButton manutencao={manutencao} disabled={!canDelete} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Manutenções</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <MaintenanceDataTable columns={columns} data={maintenances} />
      )}
    </Card>
  );
}
