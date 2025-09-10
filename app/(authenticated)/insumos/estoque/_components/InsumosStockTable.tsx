"use client";

import { getProductClassLabel } from "@/app/_helpers/getProductLabel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useInsumoStock } from "@/contexts/InsumoStockContext";
import { getToken } from "@/lib/auth-client";
import { ProductStock } from "@/types/productStock";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, SquarePenIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { InsumosDataTable } from "./InsumosDataTable";

export function InsumosStockTable() {
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const { insumos } = useInsumoStock();

  async function fetchProducts() {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/insumos/stock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const filteredData = data.filter(
        (product: ProductStock) => product.stock > 0,
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
          className="px-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row: { original: insumo } }) => insumo.product.name,
    },
    {
      accessorKey: "class",
      header: "Classe",
      cell: ({ row: { original: insumo } }) =>
        getProductClassLabel(insumo.product.class),
    },
    {
      accessorKey: "stock",
      header: () => <div className="text-left">Estoque</div>,
      cell: ({ row }) => {
        const stock = row.original.stock;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(stock)}
            <span>{row.original.product.unit}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "farm",
      header: () => <div className="text-left">Fazenda</div>,
      cell: ({ row: { original: insumo } }) => {
        return <div className="text-left">{insumo.farm?.name}</div>;
      },
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
    <Card className="p-4 font-light dark:bg-primary">
      <div className="mb-4">
        <h2 className="font-medium">Estoque de Insumos</h2>
      </div>
      {loading ? (
        <div className="py-10 text-center text-gray-500">
          <FaSpinner className="mx-auto mb-2 animate-spin" size={24} />
          <p className="text-lg">Carregando Estoque...</p>
        </div>
      ) : (
        <InsumosDataTable columns={columns} data={insumos} />
      )}
    </Card>
  );
}
