"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Cultivar } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export function ListStockTable() {
  const [products, setProducts] = useState<Cultivar[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/cultivars/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao buscar cultivares:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns: ColumnDef<Cultivar>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "product",
      header: "Produto",
    },
    {
      accessorKey: "stock",
      header: () => <div className="text-right">Estoque (kg)</div>,
      cell: ({ row }) => {
        const stock = row.original.stock;
        return <div className="text-right">{stock.toFixed(2)}</div>;
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary">
      <div className="mb-2">
        <h2>Estoque das Cultivares</h2>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <FaSpinner className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-lg">Carregando Cultivares...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={products} />
      )}
    </Card>
  );
}
