"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { Cycle } from "@/types/cycles";
import { CycleDataTable } from "./CycleDataTable";
import { format } from "date-fns";
import DetailCycleButton from "./DetailCycleButton";
import EditCycleButton from "./EditCycleButton";
import DeleteCycleButton from "./DeleteCycleButton";
import { AgroLoader } from "@/components/agro-loader";
import { useCycles } from "@/queries/registrations/use-cycles-query";

export function CycleGetTable() {

    const {
        data: safras = [],
        isLoading,
        isFetching,
        refetch,
      } = useCycles();

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
            <DetailCycleButton safra={cycle} onUpdated={refetch} />
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
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <CycleDataTable columns={columns} data={safras} />
      )}
    </Card>
  );
}
