"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Cultivar } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import EditCultivarButton from "./EditCultivarButton";
import DeleteCultivarButton from "./DeleteCultivarButton";
import { getProductLabel } from "@/app/_helpers/getProductLabel";
import { DataTable } from "@/components/ui/data-table";
import { getToken } from "@/lib/auth-client";


export function ListCultivarTable() {
  const [products, setProducts] = useState<Cultivar[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
        const token = getToken();
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="text-left px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "product",
      header: "Produto",
      cell: ({ row: { original: cultivar } }) => getProductLabel(cultivar.product),
    },
    {
      accessorKey: "actions",
      header:  () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const cultivar = row.original;

        return (
          <div className="flex items-center justify-center gap-4">
            <EditCultivarButton cultivar={cultivar} onUpdated={fetchProducts} />
            <DeleteCultivarButton cultivar={cultivar} onDeleted={fetchProducts} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="mb-4">
        <h2 className="font-light">Cultivares Cadastrados</h2>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <FaSpinner className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-lg">Carregando Cultivares...</p>
        </div>
      ) : (
        <DataTable columns={columns} data={products} />
      )}
      {/* Modais */}
    </Card>
  );
}
