"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Insumo } from "@/types/insumo";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { InsumosDataTable } from "./InsumosDataTable";
import EditInsumosButton from "./EditInsumosButton";
import DeleteInsumosButton from "./DeleteInsumosButton";
import { getProductClassLabel, getProductUnitLabel } from "@/app/_helpers/getProductLabel";
import { AgroLoader } from "@/components/agro-loader";
import { useInputProductQuery } from "@/queries/input/use-input";

export function InsumosGetTable() {
  
  const {
      data: insumos = [],
      isLoading,
      isFetching,
      refetch,
    } = useInputProductQuery();

  const columns: ColumnDef<Insumo>[] = [
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
      accessorKey: "class",
      header: "Classe",
      cell: ({ row: { original: product } }) => getProductClassLabel(product.class),
    },
    {
      accessorKey: "unit",
      header: "Unidade",
      cell: ({ row: { original: product } }) => getProductUnitLabel(product.unit),
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center justify-center gap-4">
            <EditInsumosButton product={product} />
            <DeleteInsumosButton product={product} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Insumos</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <InsumosDataTable columns={columns} data={insumos} />
      )}
    </Card>
  );
}
