"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { FuelPurchase } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { AgroLoader } from "@/components/agro-loader";
import { useUser } from "@/contexts/UserContext";
import { canUser } from "@/lib/permissions/canUser";
import { LoadingData } from "@/components/loading-data";
import DeleteFuelPurchaseButton from "./DeleteFuelPurchaseButton";
import { useFuelPurchase } from "@/queries/machines/use-fuelPurchase-query";
import EditFuelPurchaseButton from "./EditFuelPurchaseButton";
import { FuelPurchaseDataTable } from "./FuelPurchaseDataTable";

export function ListFuelPurchaseTable() {
  const { user } = useUser();
  const canDelete = canUser(user?.role, "fuelPurchase:delete");

  const {
      data: fuelPurchases = [],
      isLoading,
      isFetching,
      refetch,
    } = useFuelPurchase();

  const columns: ColumnDef<FuelPurchase>[] = [
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
      accessorKey: "document",
      header: "Documento",
      accessorFn: (row) => row.invoiceNumber,
      cell: ({ row: { original } }) => original.invoiceNumber,
    },
    {
      accessorKey: "customer",
      header: "Cliente",
      cell: ({ row: { original } }) => <div className="text-left">{original.customer?.name ? (original.customer.name) : <LoadingData />}</div>,
    },
    {
      accessorKey: "fuelTank",
      header: () => <div className="text-left">Tanque de Combustível</div>,
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
        const compra = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <EditFuelPurchaseButton compra={compra} />
            <DeleteFuelPurchaseButton compra={compra} disabled={!canDelete} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Compras</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <FuelPurchaseDataTable columns={columns} data={fuelPurchases} />
      )}
    </Card>
  );
}
