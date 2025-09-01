"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { ProductStock } from "@/types/productStock";
import { useInsumoStock } from "@/contexts/InsumoStockContext";
import { InsumosDataTable } from "./InsumosDataTable";
import { Trash2Icon, SquarePenIcon } from "lucide-react";
import { getProductUnitLabel } from "@/app/_helpers/getProductLabel";

export function InsumosStockTable() {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const { insumos } = useInsumoStock();

  async function fetchProducts() {
    try {
      const token = getToken();
      const res = await fetch("/api/insumos/stock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const filteredData = data.filter(
        (product: ProductStock) => product.stock > 0
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

  const columns: ColumnDef<ProductStock>[] = [
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
      cell: ({ row: { original: insumo } }) =>
        (insumo.product.name),
    },
    {
      accessorKey: "class",
      header: "Classe",
      cell: ({ row: { original: insumo } }) => getProductUnitLabel(insumo.product.class)
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
      accessorKey: "farm",
      header: () => <div className="text-center">Fazenda</div>,
      cell: ({ row: { original: insumo } }) => {
        return (
          <div className="text-center">
            {insumo.farm?.name}
          </div>
        );
      }
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row: { original: insumo } }) => {
        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                alert("Editar ação");
              }}
            >
              <SquarePenIcon size={20} className="text-green" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                alert("Excluir ação");
              }}
            >
              <Trash2Icon size={20} className="text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="mb-4">
        <h2 className="font-medium">Estoque das Cultivares</h2>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <FaSpinner className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-lg">Carregando Estoque...</p>
        </div>
      ) : (
        <InsumosDataTable columns={columns} data={insumos} />
      )}
    </Card>
  );
}
