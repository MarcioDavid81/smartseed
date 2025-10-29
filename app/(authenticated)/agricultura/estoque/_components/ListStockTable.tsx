"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Cultivar, IndustryStock, ProductStock } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useStock } from "@/contexts/StockContext";
import { getToken } from "@/lib/auth-client";
import { getProductLabel } from "@/app/_helpers/getProductLabel";
import { StockDataTable } from "./StockDataTable";
import { useIndustryStock } from "@/contexts/IndustryStockContext";

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
          <div className="flex items-center justify-center gap-4">
            botão
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="mb-4">
        <h2 className="font-light">Estoque das Cultivares</h2>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <FaSpinner className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-lg">Carregando Estoque...</p>
        </div>
      ) : (
        <StockDataTable columns={columns} data={stocks}/>
      )}
    </Card>
  );
}
