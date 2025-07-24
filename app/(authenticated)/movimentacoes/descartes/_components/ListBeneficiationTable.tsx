"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { Beneficiation } from "@/types";
import UpsertBeneficiationButton from "./UpsertBeneficiationButton";
import DeleteBeneficiationButton from "./DeleteBeneficiationButton";
import { BeneficiationDataTable } from "./BeneficiationDataTable";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui

export function ListBeneficiationTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado
  const [descartes, setDescartes] = useState<Beneficiation[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBeneficiations() {
    if (!selectedCycle?.id) return;

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/beneficiation?cycleId=${selectedCycle.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const filteredData = data.filter(
        (product: Beneficiation) => product.quantityKg > 0
      );
      setDescartes(filteredData);
    } catch (error) {
      console.error("Erro ao buscar descartes:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBeneficiations();
  }, [selectedCycle?.id]); // 👈 atualiza quando a safra muda

  const columns: ColumnDef<Beneficiation>[] = [
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
        const descarte = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <UpsertBeneficiationButton
              descarte={descarte}
              onUpdated={fetchBeneficiations}
            />
            <DeleteBeneficiationButton
              descarte={descarte}
              onDeleted={fetchBeneficiations}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Descartes</h2>
        <Button variant={"ghost"} onClick={fetchBeneficiations} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <FaSpinner className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-lg">Carregando descartes...</p>
        </div>
      ) : (
        <BeneficiationDataTable columns={columns} data={descartes} />
      )}
    </Card>
  );
}
