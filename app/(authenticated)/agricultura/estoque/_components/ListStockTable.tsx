"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { IndustryStock } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { getProductLabel } from "@/app/_helpers/getProductLabel";
import { StockDataTable } from "./StockDataTable";
import { useIndustryStock } from "@/contexts/IndustryStockContext";
import { AgroLoader } from "@/components/agro-loader";
import { ProductExtractButton } from "./ProductExtractButton";
import { ProductType } from "@prisma/client";
import IndustryStockAdjustmentButton from "./IndustryStockAdjustmentBotton";

export function ListStockTable() {
  const [stock, setStock] = useState<IndustryStock[]>([]);
  const [loading, setLoading] = useState(true);
  const { stocks } = useIndustryStock();


  async function fetchStock() {
    try {
      const token = getToken();
      const res = await fetch("/api/industry/stock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.table(data);
      const filteredData = data.filter(
        (product: IndustryStock) => product.quantity > 0
      );
      setStock(filteredData);
    } catch (error) {
      console.error("Erro ao buscar cultivares:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStock();
  }, []);

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
      accessorKey: "stock",
      header: () => <div className="text-center">Estoque (kg)</div>,
      cell: ({ row }) => {
        const stock = row.original.quantity;
        return (
          <div className="text-center">
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
        <h2 className="font-light">Estoque de Produtos</h2>
        <IndustryStockAdjustmentButton />
      </div>
      {loading ? (
        <AgroLoader />
      ) : (
        <StockDataTable columns={columns} data={stocks}/>
      )}
    </Card>
  );
}
