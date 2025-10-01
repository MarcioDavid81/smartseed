"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Cultivar } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useStock } from "@/contexts/StockContext";
import { getToken } from "@/lib/auth-client";
import { getProductLabel } from "@/app/_helpers/getProductLabel";
import { ProductDataTable } from "@/components/ui/product-data-table";
import { CultivarExtractButton } from "./CultivarExtractButton";
import { CultivarStatusButton } from "./CultivarStatusButton";
import { CultivarStatusBadge } from "./CultivarStatusBadge";

export function ListStockTable() {
  const [products, setProducts] = useState<Cultivar[]>([]);
  const [loading, setLoading] = useState(true);
  const { cultivars, isLoading } = useStock();

  async function fetchProducts() {
    try {
      const token = getToken();
      const res = await fetch("/api/cultivars/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const filteredData = data.filter(
        (product: Cultivar) => product.stock > 0
      );
      setProducts(filteredData);
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
      cell: ({ row: { original: cultivar } }) =>
        getProductLabel(cultivar.product),
    },
    {
      accessorKey: "stock",
      header: () => <div className="text-center">Estoque (kg)</div>,
      cell: ({ row }) => {
        const stock = row.original.stock;
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
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        return <CultivarStatusBadge status={row.original.status} />;
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const cultivar = row.original;
        return (
          <div className="flex justify-center gap-2">
            <CultivarExtractButton cultivar={cultivar} />
            <CultivarStatusButton
              cultivarId={cultivar.id}
              currentStatus={cultivar.status}
            />
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
        <ProductDataTable columns={columns} data={cultivars} />
      )}
    </Card>
  );
}
