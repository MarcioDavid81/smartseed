"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { IndustryHarvest } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { HarvestDataTable } from "./HarvestDataTable";
import DeleteHarvestButton from "./DeleteHarvestButton";
import EditHarvestButton from "./EditHarvestButton";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui
import { AgroLoader } from "@/components/agro-loader";
import { useUser } from "@/contexts/UserContext";
import { canUser } from "@/lib/permissions/canUser";
import { useIndustryHarvests } from "@/queries/industry/use-harvests.query";

export function ListHarvestTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado
  const { user } = useUser();
  const canDelete = canUser(user.role, "harvest:delete");

  const {
    data: industryHarvests = [],
    isLoading,
    isFetching,
    refetch,
  } = useIndustryHarvests(selectedCycle?.id);

  const columns: ColumnDef<IndustryHarvest>[] = [
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
      accessorKey: "document",
      header: "Documento",
      cell: ({ row: { original } }) => original.document,
    },
    {
      id: "farm",
      header: () => <div className="text-left">Fazenda</div>,
      accessorFn: (row) => row.talhao?.farm?.name ?? "",
      filterFn: "includesString",
      cell: ({ row: { original } }) => <div className="text-left">{original.talhao.farm.name}</div>,
    },
    {
      id: "talhao",
      header: "Talhão",
      accessorFn: (row) => row.talhao?.name ?? "",
      filterFn: "includesString",
      cell: ({ row: { original } }) => original.talhao.name,
    },
    {
      accessorKey: "industryTransporter",
      header: () => <div className="text-left">Transportador</div>,
      cell: ({ row }) => {
        const transportador = row.original.industryTransporter.name;
        return (
          <div className="text-left">
            {transportador}
          </div>
        );
      },
    },
    {
      id: "industryDeposit",
      header: () => <div className="text-left">Depósito</div>,
      accessorFn: (row) => row.industryDeposit?.name ?? "",
      filterFn: "includesString",
      cell: ({ row: { original } }) => <div className="text-left">{original.industryDeposit.name}</div>,
    },
    {
      accessorKey: "weightLiq",
      header: () => <div className="text-left">Quantidade (kg)</div>,
      cell: ({ row }) => {
        const peso = row.original.weightLiq;
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
            <EditHarvestButton colheita={colheita} onUpdated={refetch} />
            <DeleteHarvestButton colheita={colheita} onDeleted={refetch} disabled={!canDelete} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Colheitas</h2>
        <Button variant="ghost" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <HarvestDataTable columns={columns} data={industryHarvests} sumColumnId="weightLiq" />
      )}
    </Card>
  );
}
