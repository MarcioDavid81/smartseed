"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Harvest } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { HarvestDataTable } from "./HarvestDataTable";
import DeleteHarvestButton from "./DeleteHarvestButton";
import UpsertHarvestButton from "./UpsertHarvestButton";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui

export function ListHarvestTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchHarvests() {
    if (!selectedCycle?.id) return;

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/harvest?cycleId=${selectedCycle.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const filteredData = data.filter((product: Harvest) => product.quantityKg > 0);
      setHarvests(filteredData);
    } catch (error) {
      console.error("Erro ao buscar colheitas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHarvests();
  }, [selectedCycle?.id]); // 👈 atualiza quando a safra muda

  const columns: ColumnDef<Harvest>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row: { original } }) => new Date(original.date).toLocaleDateString("pt-BR"),
    },
    {
      accessorKey: "cultivar",
      header: "Cultivar",
      accessorFn: (row) => row.cultivar.name,
      cell: ({ row: { original } }) => original.cultivar.name,
    },
    {
      accessorKey: "talhao",
      header: "Talhão",
      cell: ({ row: { original } }) => original.talhao.name,
    },
    {
      accessorKey: "farm",
      header: () => <div className="text-left">Fazenda</div>,
      cell: ({ row: { original } }) => <div className="text-left">{original.talhao.farm.name}</div>,
    },
    {
      accessorKey: "quantityKg",
      header: () => <div className="text-left">Quantidade (kg)</div>,
      cell: ({ row }) => {
        const peso = row.original.quantityKg;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(peso)}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const colheita = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <UpsertHarvestButton colheita={colheita} onUpdated={fetchHarvests} />
            <DeleteHarvestButton colheita={colheita} onDeleted={fetchHarvests} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Colheitas</h2>
        <Button variant={"ghost"} onClick={fetchHarvests} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <FaSpinner className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-lg">Carregando Colheitas...</p>
        </div>
      ) : (
        <HarvestDataTable columns={columns} data={harvests} />
      )}
    </Card>
  );
}
