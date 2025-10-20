"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { Cycle } from "@/types/cycles";
import { CycleDataTable } from "./CycleDataTable";
import { format } from "date-fns";
import DetailCycleButton from "./DetailCycleButton";
import EditCycleButton from "./EditCycleButton";
import DeleteCycleButton from "./DeleteCycleButton";

export function CycleGetTable() {
  const [cycle, setCycle] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCycles() {
    try {
      const token = getToken();
      const res = await fetch("/api/cycles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.table(data);
      setCycle(data);
    } catch (error) {
      console.error("Erro ao buscar safras:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCycles();
  }, []);

  const columns: ColumnDef<Cycle>[] = [
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
      accessorKey: "startDate",
      header: "Data de Início",
      cell: ({ row }) => {
        const cycle = row.original
        return cycle.startDate ? (
          <span>{format(new Date(cycle.startDate), "dd/MM/yyyy")}</span>
        ) : (
          <span className="text-red-500">N/A</span>
        )
      },
    },
    {
      accessorKey: "endDate",
      header: "Data de Fim",
      cell: ({ row }) => {
        const cycle = row.original
        return (
          <span>{format(new Date(cycle.endDate), "dd/MM/yyyy")}</span>
        )
      },
    },
    {
      accessorKey: "talhoes",
      header: "Talhões",
      cell: ({ row }) => {
        const cycle = row.original
        return (
          <span>{cycle.talhoes.map((talhao) => talhao.talhao.name).slice(0, 2).join(", ")} {cycle.talhoes.length > 2 ? `+ ${cycle.talhoes.length - 2}` : ""}</span>
        )
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const cycle = row.original
        return (
          <div className="flex items-center justify-center gap-4">
            <DetailCycleButton safra={cycle} onUpdated={fetchCycles} />
            <EditCycleButton safraId={cycle.id} />
            <DeleteCycleButton  />
          </div>
        );
      },
    },
  ];  

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Safras</h2>
        <Button variant={"ghost"} onClick={fetchCycles} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <div className="py-10 text-center text-gray-500">
          <FaSpinner className="mx-auto mb-2 animate-spin" size={24} />
          <p className="text-lg">Carregando Safras...</p>
        </div>
      ) : (
        <CycleDataTable columns={columns} data={cycle} />
      )}
    </Card>
  );
}
