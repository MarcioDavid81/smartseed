"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Transfer } from "@/types/transfer";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import DeleteTransferButton from "./DeleteTransferButton";
import { TransferDataTable } from "./TransferDataTable";
import UpsertTransferButton from "./UpsertTransferButton";
import { AgroLoader } from "@/components/agro-loader";
import { useInputTransferQuery } from "@/queries/input/use-input-transfer";
import { LoadingData } from "@/components/loading-data";

export function ListTransferTable() {

  const {
      data: inputTransfers = [],
      isLoading,
      isFetching,
      refetch,
    } = useInputTransferQuery();

  const columns: ColumnDef<Transfer>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row: { original } }) => {
        return new Date(original.date).toLocaleDateString("pt-BR");
      },
    },
    {
      id: "product",
      header: "Produto",
      accessorFn: (row) => row.product?.name ?? "",
      filterFn: "includesString",
      cell: ({ row }) => {
        const produto = row.original.product;
         if ((row.original as any)._optimistic || produto === undefined) {
          return <LoadingData />;
        }
           
        if (!produto) {
          return (
            <span className="text-muted-foreground italic text-sm">
              -
            </span>
          );
        }
      return <span>{produto.name}</span>;
      },
    },
    {
      accessorKey: 'quantity',
      header: () => <div className="text-left">Quantidade</div>,
      cell: ({ row }) => {
        const peso = row.original.quantity;
        const product = row.original.product;

        if ((row.original as any)._optimistic || product === undefined) {
          return <LoadingData />;
        }

        const unit = product?.unit;
        if (!unit) {
          return (
            <span className="text-muted-foreground text-sm">-</span>
          );
        }

        return (
          <span>
            {new Intl.NumberFormat('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(peso)}{' '}
            {unit.toLocaleLowerCase()}
          </span>
        );
      },
    },
    {
      accessorKey: "origem",
      header: "Depósito de Origem",
      cell: ({ row }) => {
        const farm = row.original.originFarm;
         if ((row.original as any)._optimistic || farm === undefined) {
          return <LoadingData />;
        }
           
        if (!farm) {
          return (
            <span className="text-muted-foreground italic text-sm">
              -
            </span>
          );
        }
      return <span>{farm.name}</span>;
      },
    },
    {
      id: "destFarm",
      header: "Depósito de Destino",
      accessorFn: (row) => row.destFarm?.name ?? "",
      filterFn: "includesString",
      cell: ({ row }) => {
        const farm = row.original.destFarm;
         if ((row.original as any)._optimistic || farm === undefined) {
          return <LoadingData />;
        }
           
        if (!farm) {
          return (
            <span className="text-muted-foreground italic text-sm">
              -
            </span>
          );
        }
      return <span>{farm.name}</span>;
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const transferencias = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <UpsertTransferButton transferencia={transferencias} />
            <DeleteTransferButton transferencia={transferencias} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="font-light">Lista de Transferências</h2>
        <Button
          variant={"ghost"}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <TransferDataTable columns={columns} data={inputTransfers} />
      )}
    </Card>
  );
}
