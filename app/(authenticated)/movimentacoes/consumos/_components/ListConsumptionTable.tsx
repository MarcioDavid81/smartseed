"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { Consumption } from "@/types/consumption";
import { Farm } from "@/types";
import UpsertConsumptionButton from "./UpsertConsumptionButton";
import DeleteConsumptionButton from "./DeleteConsumptionButton";
import { ConsumptionDataTable } from "./ConsumptionDataTable";

export function ListConsumptionTable() {
  const [plantios, setPlantios] = useState<Consumption[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchConsumptions() {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/consumption", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const filteredData = data.filter(
        (product: Consumption) => product.quantityKg > 0
      );
      setPlantios(filteredData);
    } catch (error) {
      console.error("Erro ao buscar plantios:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConsumptions();
  }, []);

  const columns: ColumnDef<Consumption>[] = [
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
      cell: ({ row: { original } }) => {
        return new Date(original.date).toLocaleDateString("pt-BR");
      },
    },
    {
      accessorKey: "cultivar",
      header: "Cultivar",
      accessorFn: (row) => row.cultivarId,
      cell: ({ row: { original } }) => original.cultivar.name,
    },
        {
      accessorKey: "farm",
      header: "Destino",
      accessorFn: (row) => row.farmId,
      cell: ({ row: { original } }) => original.farm.name,
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
        const palntio = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <UpsertConsumptionButton
              plantio={palntio}
              onUpdated={fetchConsumptions}
            />
            <DeleteConsumptionButton
              plantio={palntio}
              onDeleted={fetchConsumptions}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Plantio</h2>
        <Button
          variant={"ghost"}
          onClick={fetchConsumptions}
          disabled={loading}
        >
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <FaSpinner className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-lg">Carregando plantios...</p>
        </div>
      ) : (
        <ConsumptionDataTable columns={columns} data={plantios} />
      )}
    </Card>
  );
}
