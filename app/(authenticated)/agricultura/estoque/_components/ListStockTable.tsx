"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { IndustryStock } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getProductLabel } from "@/app/_helpers/getProductLabel";
import { StockDataTable } from "./StockDataTable";
import { useIndustryStock } from "@/queries/industry/use-stock-query";
import { AgroLoader } from "@/components/agro-loader";
import { ProductExtractButton } from "./ProductExtractButton";
import { ProductType } from "@prisma/client";

export function ListStockTable() {

    const {
        data: stocks = [],
        isLoading,
        isFetching,
        refetch,
      } = useIndustryStock();

  const columns: ColumnDef<IndustryStock>[] = [
    {
      accessorKey: "product",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row: { original: stock } }) =>
        getProductLabel(stock.product as ProductType),
    },
    {
      accessorKey: "industryDeposit",
      header: "Depósito",
      cell: ({ row: { original: stock } }) =>
        getProductLabel(stock.industryDeposit.name),
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-left">Estoque (kg)</div>,
      cell: ({ row }) => {
        const stock = row.original.quantity;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(stock)}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const stock = row.original;
        return (
          <div className="flex items-center justify-center">
            <ProductExtractButton product={stock.product as ProductType} deposit={stock.industryDeposit} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-light">Estoque de Produtos</h2>
          <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <StockDataTable columns={columns} data={stocks} sumColumnId="quantity" />
      )}
    </Card>
  );
}
