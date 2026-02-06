"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Buy } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import UpsertBuyButton from "./UpsertBuyButton";
import { BuyDataTable } from "./BuyDataTable";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui
import DeleteBuyButton from "./DeleteBuyButton";
import DetailBuyButton from "./DetailBuyButton";
import { AgroLoader } from "@/components/agro-loader";
import { useSeedBuysByCycle } from "@/queries/seed/use-seed-buy-query";
import { LoadingData } from "@/components/loading-data";

export function ListBuyTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado

  const {
      data: compras = [],
      isLoading,
      isFetching,
      refetch, 
    } = useSeedBuysByCycle(selectedCycle?.id || "");

  const columns: ColumnDef<Buy>[] = [
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
      cell: ({ row: { original } }) => {
        return new Date(original.date).toLocaleDateString("pt-BR");
      },
    },
    {
      accessorKey: "cultivar",
      header: "Cultivar",
      cell: ({ row }) => {
        const cultivar = row.original.cultivar;
         if ((row.original as any)._optimistic) {
            return <LoadingData />;
          }
        
        if (!cultivar) {
          return (
            <span className="text-muted-foreground italic text-sm">
              Sem cultivar
            </span>
          );
        }
      return <span>{cultivar.name}</span>;
      },
    },
    {
      accessorKey: "customer",
      header: "Fornecedor",
      cell: ({ row }) => {
        const customer = row.original.customer;
        if ((row.original as any)._optimistic) {
          return <LoadingData />;
        }
        if (!customer) {
          return (
            <span className="text-muted-foreground italic text-sm">
              Sem fornecedor
            </span>
          );
        }
        return <span>{customer.name}</span>;
      },
    },
    {
      accessorKey: "invoice",
      header: "Nota Fiscal",
      cell: ({ row: { original } }) => original.invoice,
    },
    {
      accessorKey: "quantityKg",
      header: () => <div className="text-left">Quantidade (kg)</div>,
      cell: ({ row }) => {
        const peso = row.original.quantityKg;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(peso)}
          </div>
        );
      },
    },
    {
      accessorKey: "unityPrice",
      header: () => <div className="text-left">Preço (kg)</div>,
      cell: ({ row }) => {
        const valor = row.original.unityPrice;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(valor)}
          </div>
        );
      },
    },
    {
      accessorKey: "totalPrice",
      header: () => <div className="text-left">Preço Total</div>,
      cell: ({ row }) => {
        const valor = row.original.totalPrice;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(valor)}
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
            <DetailBuyButton compra={compra} />
            <UpsertBuyButton compra={compra} />
            <DeleteBuyButton compra={compra} />
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
        <BuyDataTable columns={columns} data={compras} />
      )}
    </Card>
  );
}
