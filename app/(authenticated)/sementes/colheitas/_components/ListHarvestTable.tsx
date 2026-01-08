"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Harvest } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { HarvestDataTable } from "./HarvestDataTable";
import DeleteHarvestButton from "./DeleteHarvestButton";
import UpsertHarvestButton from "./UpsertHarvestButton";
import DetailHarvestButton from "./DetailHarvestButton";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui
import { AgroLoader } from "@/components/agro-loader";
import { useSeedHarvestsByCycle } from "@/queries/seed/use-seed-harvest-query";
import { LoadingData } from "@/components/loading-data";

export function ListHarvestTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado

  const {
    data: colheitas = [],
    isLoading,
    isFetching,
    refetch, 
  } = useSeedHarvestsByCycle(selectedCycle?.id || "");

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
      cell: ({ row }) => {
        const cultivar = row.original.cultivar;
         if ((row.original as any)._optimistic) {
          return <LoadingData />;
         }
              
        if (!cultivar) {
         return (
          <span className="text-muted-foreground italic text-sm">
            Sem cultivar
          </span>
         );
        }
      return <span>{cultivar.name}</span>;
      },
    },
    {
      accessorKey: "talhao",
      header: "Talhão",
      cell: ({ row }) => {
        const talhao = row.original.talhao;
        if ((row.original as any)._optimistic) {
          return <LoadingData />;
        }
        if (!talhao) {
          return (
            <span className="text-muted-foreground italic text-sm">
              Sem talhão
            </span>
          );
        }
        return <span>{talhao.name}</span>;
      },
    },
    {
      accessorKey: "farm",
      header: () => <div className="text-left">Fazenda</div>,
      cell: ({ row }) => {
        const farm = row.original.talhao?.farm;
        if ((row.original as any)._optimistic) {
          return <LoadingData />;
        }
        if (!farm) {
          return (
            <span className="text-muted-foreground italic text-sm">
              Sem fazenda
            </span>
          );
        }
        return <div className="text-left">{farm.name}</div>;
      },
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
            <DetailHarvestButton colheita={colheita} />
            <UpsertHarvestButton colheita={colheita} />
            <DeleteHarvestButton colheita={colheita} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Colheitas</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <HarvestDataTable columns={columns} data={colheitas} />
      )}
    </Card>
  );
}
