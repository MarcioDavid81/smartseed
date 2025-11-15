"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Talhao } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { PlotsDataTable } from "./PlotsDataTable";
import DeletePlotButton from "./DeletePlotButton";
import EditPlotButton from "./EditPlotButton";
import { AgroLoader } from "@/components/agro-loader";

export function ListPlotsTable() {
  const [plots, setPlots] = useState<Talhao[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPlots() {

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/plots`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setPlots(data);
    } catch (error) {
      console.error("Erro ao buscar talhões:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlots();
  }, []);

  const columns: ColumnDef<Talhao>[] = [
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
      cell: ({ row: { original } }) => original.name,
    },
    {
      accessorKey: "area",
      header: "Área (ha)",
      accessorFn: (row) => row.area,
      cell: ({ row: { original } }) => original.area,
    },
    {
      accessorKey: "fazenda",
      header: "Fazenda",
      cell: ({ row: { original } }) => original.farm.name,
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const talhao = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <EditPlotButton talhao={talhao} onUpdated={fetchPlots} />
            <DeletePlotButton talhao={talhao} onDeleted={fetchPlots} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Talhões</h2>
        <Button variant={"ghost"} onClick={fetchPlots} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <AgroLoader />
      ) : (
        <PlotsDataTable columns={columns} data={plots} />
      )}
    </Card>
  );
}
