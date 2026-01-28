"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { AgroLoader } from "@/components/agro-loader";
import { InputStockStatementItem } from "@/types";
import { useInputStockStatementQuery } from "@/queries/input/use-input-stock";
import { useFarms } from "@/queries/registrations/use-farm";
import { InputMovementBadge } from "./InputMovementBadge";
import { InputStockStatementDataTable } from "./InputStockStatementDataTable";

type Props = {
  productId: string;
  farmId: string;
};

export function ListInputStockStatementTable({
  productId,
  farmId,
}: Props) {

  const {
    data: inputStockStatement = [],
    isLoading,
  } = useInputStockStatementQuery(productId, farmId);

  const { 
    data: farms = [], 
    isLoading: isFarmLoading,
  } = useFarms();

  const currentStock = inputStockStatement.length > 0 ? inputStockStatement[0].balance:0;

  const productName = inputStockStatement[0]?.productName;

  const columns: ColumnDef<InputStockStatementItem>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        new Date(row.original.date).toLocaleDateString("pt-BR"),
    },
    {
      accessorKey: "type",
      header: () => <div className="text-center">Tipo</div>,
      cell: ({ row }) => (
        <InputMovementBadge type={row.original.type} />
      ),
    },
    {
      accessorKey: "origin",
      header: "Origem",
      cell: ({ row }) => {
        if (row.original.operation === "COMPRA") return "Compra";
        if (row.original.operation === "TRANSFERENCIA") return "Transferência";
        return "Aplicação";
      },
    },
    {
      accessorKey: "quantityIn",
      header: () => <div className="text-right">Entrada</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.quantityIn?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      accessorKey: "quantityOut",
      header: () => <div className="text-right">Saída</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.quantityOut?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: () => <div className="text-right">Saldo</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.balance?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </div>
      ),
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center justify-between">
        <div className="mb-4">
          <h1 className="text-2xl font-medium">
            {(productName ?? "").toUpperCase()}
          </h1>
          {farms.length > 0 && (
            <p>
              Fazenda: <strong>{farms.find(farm => farm.id === farmId)?.name.toUpperCase()}</strong> | Estoque Atual:{" "}
              <strong>
                {currentStock?.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
              </strong>
            </p>
          )}
        </div>
      </div>
      {isLoading || isFarmLoading ? (
        <AgroLoader />
      ) : (
        <InputStockStatementDataTable
          columns={columns}
          data={inputStockStatement}
        />
      )}
    </Card>
  );
}
