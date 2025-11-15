"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Insumo } from "@/types/insumo";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { InsumosDataTable } from "./InsumosDataTable";
import EditInsumosButton from "./EditInsumosButton";
import DeleteInsumosButton from "./DeleteInsumosButton";
import { getProductClassLabel, getProductUnitLabel } from "@/app/_helpers/getProductLabel";
import { AgroLoader } from "@/components/agro-loader";

export function InsumosGetTable() {
  const [insumo, setInsumo] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      const token = getToken();
      const res = await fetch("/api/insumos/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.table(data);
      setInsumo(data);
    } catch (error) {
      console.error("Erro ao buscar insumos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns: ColumnDef<Insumo>[] = [
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
      accessorKey: "class",
      header: "Classe",
      cell: ({ row: { original: product } }) => getProductClassLabel(product.class),
    },
    {
      accessorKey: "unit",
      header: "Unidade",
      cell: ({ row: { original: product } }) => getProductUnitLabel(product.unit),
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center justify-center gap-4">
            <EditInsumosButton product={product} onUpdated={fetchProducts} />
            <DeleteInsumosButton product={product} onDeleted={fetchProducts} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Insumos</h2>
        <Button variant={"ghost"} onClick={fetchProducts} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <AgroLoader />
      ) : (
        <InsumosDataTable columns={columns} data={insumo} />
      )}
    </Card>
  );
}
