"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { Consumption } from "@/types/consumption";
import UpsertConsumptionButton from "./UpsertConsumptionButton";
import DeleteConsumptionButton from "./DeleteConsumptionButton";
import { ConsumptionDataTable } from "./ConsumptionDataTable";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui
import DetailConsumptionButton from "./DetailConsumptionButton";
import { AgroLoader } from "@/components/agro-loader";
import { useSeedConsumptionsByCycle } from "@/queries/seed/use-seed-consumption.query";
import { LoadingData } from "@/components/loading-data";

export function ListConsumptionTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado

   const {
      data: plantios = [],
      isLoading,
      isFetching,
      refetch, 
    } = useSeedConsumptionsByCycle(selectedCycle?.id || "");

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
      accessorKey: "farm",
      header: "Fazenda",
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
      accessorKey: "plot",
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
        const plantio = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <DetailConsumptionButton
              plantio={plantio}
              onUpdated={refetch}
            />
            <UpsertConsumptionButton
              plantio={plantio}
            />
            <DeleteConsumptionButton
              plantio={plantio}
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
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <ConsumptionDataTable columns={columns} data={plantios} />
      )}
    </Card>
  );
}
