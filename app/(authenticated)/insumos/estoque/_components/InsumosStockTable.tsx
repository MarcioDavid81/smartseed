"use client";

import { getProductClassLabel } from "@/app/_helpers/getProductLabel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductStock } from "@/types/productStock";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, SquarePenIcon, Trash2Icon, RefreshCw } from "lucide-react";
import { InsumosDataTable } from "./InsumosDataTable";
import { AgroLoader } from "@/components/agro-loader";
import { useInputStockQuery } from "@/queries/input/use-input-stock";

export function InsumosStockTable() {

  const {
    data: insumos = [],
    isLoading,
    isFetching,
    refetch,
  } = useInputStockQuery();

  const columns: ColumnDef<ProductStock>[] = [
    {
      accessorKey: "product",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Produto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) => row.product.name,
      cell: ({ row: { original: insumo } }) => insumo.product.name,
    },
    {
      accessorKey: "class",
      header: "Classe",
      accessorFn: (row) => row.product.class,
      cell: ({ row: { original: insumo } }) =>
        getProductClassLabel(insumo.product.class),
    },
    {
      accessorKey: "stock",
      header: () => <div className="text-left">Estoque</div>,
      cell: ({ row }) => {
        const stock = row.original.stock;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(stock)}
            <span>{` ${row.original.product.unit.toLocaleLowerCase()}`}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "farm",
      header: () => <div className="text-left">Depósito</div>,
      cell: ({ row: { original: insumo } }) => {
        return <div className="text-left">{insumo.farm?.name}</div>;
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const insumo = row.original;
        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                alert(`Editar ${insumo.product.name}`);
              }}
            >
              <SquarePenIcon size={20} className="text-green" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                alert(`Excluir ${insumo.product.name}`);
              }}
            >
              <Trash2Icon size={20} className="text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Estoque de Insumos</h2>
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
