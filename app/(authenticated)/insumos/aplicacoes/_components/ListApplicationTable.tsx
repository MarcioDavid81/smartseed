"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui
import { Application } from "@/types/application";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { ApplicationDataTable } from "./ApplicationDataTable";
import DeleteApplicationButton from "./DeleteApplicationButton";
import UpsertApplicationButton from "./UpsertApplicationButton";
import { AgroLoader } from "@/components/agro-loader";
import { useInputApplicationsQuery } from "@/queries/input/use-input-application";
import { LoadingData } from "@/components/loading-data";

export function ListApplicationTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado

  const {
    data: aplicacoes = [],
    isLoading,
    isFetching,
    refetch,
  } = useInputApplicationsQuery(selectedCycle?.id);

  const columns: ColumnDef<Application>[] = [
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
      accessorFn: (row) => row.productStock.product.name ?? "",
      filterFn: "includesString",
      cell: ({ row }) => {
        const produto = row.original.productStock.product;
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
      accessorKey: "quantity",
      header: () => <div className="text-left">Quantidade</div>,
      cell: ({ row }) => {
        const peso = row.original.quantity;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(peso)}
            <span>{` ${row.original.productStock.product.unit.toLocaleLowerCase()}`}</span>
          </div>
        );
      },
    },
    {
      id: "talhao",
      header: "Destino",
      accessorFn: (row) => row.talhao.name ?? "",
      filterFn: "includesString",
      cell: ({ row }) => {
        const talhao = row.original.talhao;
         if ((row.original as any)._optimistic || talhao === undefined) {
          return <LoadingData />;
        }
           
        if (!talhao) {
          return (
            <span className="text-muted-foreground italic text-sm">
              -
            </span>
          );
        }
      return <span>{talhao.name}</span>;
      },
    },
    {
      accessorKey: "area",
      header: () => <div className="text-left">Área (ha)</div>,
      cell: ({ row }) => {
        const area = row.original.talhao.area;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(area)}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const aplicacao = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <UpsertApplicationButton aplicacao={aplicacao} />
            <DeleteApplicationButton aplicacao={aplicacao} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="font-light">Lista de Aplicações</h2>
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
        <ApplicationDataTable columns={columns} data={aplicacoes} />
      )}
    </Card>
  );
}
