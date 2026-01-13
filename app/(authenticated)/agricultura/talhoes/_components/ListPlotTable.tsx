"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Talhao } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { PlotsDataTable } from "./PlotsDataTable";
import DeletePlotButton from "./DeletePlotButton";
import EditPlotButton from "./EditPlotButton";
import { AgroLoader } from "@/components/agro-loader";
import { usePlots } from "@/queries/registrations/use-plot-query";
import { LoadingData } from "@/components/loading-data";

export function ListPlotsTable() {

  const {
      data: talhoes = [],
      isLoading,
      isFetching,
      refetch,
    } = usePlots();

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
      id: "farm",
      header: "Fazenda",
      accessorFn: (row) => row.farm?.name ?? "",
      filterFn: "includesString",
      cell: ({ row: { original } }) => <div>{original.farm?.name ? (original.farm.name) : <LoadingData />}</div>,
    },
    {
      accessorKey: "area",
      header: "Área (ha)",
      accessorFn: (row) => row.area,
      cell: ({ row: { original } }) => new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(original.area),
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const talhao = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <EditPlotButton talhao={talhao} />
            <DeletePlotButton talhao={talhao} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Talhões</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <PlotsDataTable columns={columns} data={talhoes} sumColumnId="area" />
      )}
    </Card>
  );
}
