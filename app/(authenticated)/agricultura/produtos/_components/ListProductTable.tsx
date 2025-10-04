"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Insumo } from "@/types/insumo";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { getProductClassLabel, getProductUnitLabel } from "@/app/_helpers/getProductLabel";
import { IndustryProduct } from "@/types";
import EditIndustryProductButton from "./EditProductButton";
import DeleteIndustryProductButton from "./DeleteProductButton";
import { IndustryProductDataTable } from "./ProductDataTable";

export function IndustryProductGetTable() {
  const [industryProduct, setIndustryProduct] = useState<IndustryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      const token = getToken();
      const res = await fetch("/api/industry/product", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.table(data);
      setIndustryProduct(data);
    } catch (error) {
      console.error("Erro ao buscar insumos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns: ColumnDef<IndustryProduct>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center justify-center gap-4">
            <EditIndustryProductButton industryProduct={product} onUpdated={fetchProducts} />
            <DeleteIndustryProductButton industryProduct={product} onDeleted={fetchProducts} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Produtos</h2>
        <Button variant={"ghost"} onClick={fetchProducts} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <div className="py-10 text-center text-gray-500">
          <FaSpinner className="mx-auto mb-2 animate-spin" size={24} />
          <p className="text-lg">Carregando Produtos...</p>
        </div>
      ) : (
        <IndustryProductDataTable columns={columns} data={industryProduct} />
      )}
    </Card>
  );
}
