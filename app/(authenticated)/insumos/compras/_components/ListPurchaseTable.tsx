"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Purchase } from "@/types/purchase";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import UpsertPurchaseButton from "./UpsertPurchaseButton";
import DeletePurchaseButton from "./DeletePurchaseButton";
import { PurchaseDataTable } from "./PurchaseDataTable";
import DetailPurchaseButton from "./DetailPurchaseButton";
import { AgroLoader } from "@/components/agro-loader";
import { useInputPurchaseQuery } from "@/queries/input/use-input-purchase";
import { LoadingData } from "@/components/loading-data";

export function ListPurchaseTable() {

  const {
      data: inputPurchases = [],
      isLoading,
      isFetching,
      refetch,
    } = useInputPurchaseQuery();

  const columns: ColumnDef<Purchase>[] = [
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
      accessorKey: "product",
      header: "Produto",
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
      accessorKey: "customer",
      header: "Fornecedor",
      cell: ({ row }) => {
        const fornecedor = row.original.customer;
         if ((row.original as any)._optimistic || fornecedor === undefined) {
          return <LoadingData />;
        }
           
        if (!fornecedor) {
          return (
            <span className="text-muted-foreground italic text-sm">
              -
            </span>
          );
        }
      return <span>{fornecedor.name}</span>;
      },
    },
    {
      accessorKey: "invoiceNumber",
      header: "Nota Fiscal",
      cell: ({ row: { original: original } }) => original.invoiceNumber,
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
      accessorKey: "unitPrice",
      header: () => <div className="text-left">Preço Unitário</div>,
      cell: ({ row }) => {
        const valor = row.original.unitPrice;
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
            <DetailPurchaseButton compra={compra} />
            <UpsertPurchaseButton compra={compra} />
            <DeletePurchaseButton compra={compra} />
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
        <PurchaseDataTable columns={columns} data={inputPurchases} />
      )}
    </Card>
  );
}
