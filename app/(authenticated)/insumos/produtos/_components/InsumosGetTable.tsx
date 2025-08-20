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
import { Trash2Icon, SquarePenIcon } from "lucide-react";

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
      cell: ({ row }) => <p>{row.original.class}</p>,
    },
    {
      accessorKey: "unit",
      header: "Unidade",
      cell: ({ row }) => <p>{row.original.unit}</p>,
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center gap-2">
            <Button variant="ghost" size="sm">
              <SquarePenIcon />
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2Icon />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-medium">Lista de Insumos</h2>
        <Button variant={"ghost"} onClick={fetchProducts} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <div className="py-10 text-center text-gray-500">
          <FaSpinner className="mx-auto mb-2 animate-spin" size={24} />
          <p className="text-lg">Carregando Insumos...</p>
        </div>
      ) : (
        <InsumosDataTable columns={columns} data={insumo} />
      )}
    </Card>
  );
}
