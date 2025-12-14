"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { IndustrySale } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { SaleDataTable } from "./SaleDataTable";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui
import { AgroLoader } from "@/components/agro-loader";
import DeleteSaleButton from "./DeleteSaleButton";
import EditSaleButton from "./EditSaleButton";
import { useUser } from "@/contexts/UserContext";
import { canUser } from "@/lib/permissions/canUser";
import { useIndustrySales } from "@/queries/industry/use-sale-query";

export function ListSaleTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado
  const { user } = useUser();
  const canDelete = canUser(user.role, "sale:delete");

  const {
      data: industrySales = [],
      isLoading,
      isFetching,
      refetch,
    } = useIndustrySales(selectedCycle?.id);

  const columns: ColumnDef<IndustrySale>[] = [
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
      accessorFn: (row) => row.document,
      cell: ({ row: { original } }) => original.document,
    },
    {
      accessorKey: "customer",
      header: "Cliente",
      cell: ({ row: { original } }) => original.customer.name,
    },
    {
      accessorKey: "industryTransporter",
      header: () => <div className="text-left">Transportador</div>,
      cell: ({ row }) => {
        const transportador = row.original.industryTransporter?.name;
        return (
          <div className="text-left">
            {transportador}
          </div>
        );
      },
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
        const venda = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <EditSaleButton venda={venda} onUpdated={refetch} />
            <DeleteSaleButton venda={venda} onDeleted={refetch} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Vendas</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <SaleDataTable columns={columns} data={industrySales} />
      )}
    </Card>
  );
}
