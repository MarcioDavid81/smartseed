"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { SaleDataTable } from "./SaleDataTable";
import DeleteSaleButton from "./DeleteSaleButton";
import UpsertSaleButton from "./UpsertSaleButton";
import { Sale } from "@/types/sale";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui
import DetailSaleButton from "./DetailSaleButton";
import { AgroLoader } from "@/components/agro-loader";
import { useSeedSalesByCycle } from "@/queries/seed/use-seed-sale-query";
import { LoadingData } from "@/components/loading-data";

export function ListSaleTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado
  
  const {
    data: vendas = [],
    isLoading,
    isFetching,
    refetch, 
  } = useSeedSalesByCycle();

  const columns: ColumnDef<Sale>[] = [
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
      id: "cultivar",
      header: "Cultivar",
      accessorFn: (row) => row.cultivar.name,
      filterFn: "includesString",
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
      id: "customer",
      header: "Cliente",
      accessorFn: (row) => row.customer.name,
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
      accessorKey: "invoiceNumber",
      header: "Nota Fiscal",
      cell: ({ row: { original: original } }) => original.invoiceNumber,
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
      accessorKey: "saleValue",
      header: () => <div className="text-left">Valor da Venda</div>,
      cell: ({ row }) => {
        const valor = row.original.saleValue;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(valor ?? 0)}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const venda = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <DetailSaleButton
              venda={venda}
            />
            <UpsertSaleButton
              venda={venda}
            />
            <DeleteSaleButton
              venda={venda}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Vendas</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <SaleDataTable columns={columns} data={vendas} sumColumnId="quantityKg" />
      )}
    </Card>
  );
}
