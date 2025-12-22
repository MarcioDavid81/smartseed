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
import DetailBeneficiationButton from "./DetailBeneficiationButton";
import { AgroLoader } from "@/components/agro-loader";
import { useSeedBeneficiationsByCycle } from "@/queries/seed/use-seed-beneficiation-query";

export function ListBeneficiationTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado

  const {
    data: descartes = [],
    isLoading,
    isFetching,
    refetch, 
  } = useSeedBeneficiationsByCycle(selectedCycle?.id || "");

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
      accessorFn: (row) => row.cultivar.name,
      cell: ({ row: { original } }) => original.cultivar.name || "Nenhum",
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
      accessorKey: "destination",
      header: () => <div className="text-left">Destino</div>,
      cell: ({ row }) => {
        const destination = row.original.destination;
        return (
          <div className="text-left">
            {destination?.name || "Nenhum"}
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
            <DetailBeneficiationButton
              descarte={descarte}
              onUpdated={refetch}
            />
            <UpsertBeneficiationButton
              descarte={descarte}
              onUpdated={refetch}
            />
            <DeleteBeneficiationButton
              descarte={descarte}
              onDeleted={refetch}
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
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <BeneficiationDataTable columns={columns} data={descartes} />
      )}
    </Card>
  );
}
