"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { AgroLoader } from "@/components/agro-loader";
import { IndustryStockStatementDataTable } from "./IndustryStockStatementDataTable";
import { IndustryStockStatementItem } from "@/types";
import { IndustryMovementBadge } from "./IndustryMovementBadge";
import { useIndustryStockStatement } from "@/queries/industry/use-stock-statement-query";
import { ProductType } from "@prisma/client";
import { useIndustryDeposit } from "@/queries/industry/use-deposit-query";
import IndustryStockAdjustmentButton from "../../_components/IndustryStockAdjustmentBotton";

type Props = {
  product: ProductType;
  depositId: string;
};

export function ListIndustryStockStatementTable({
  product,
  depositId,
}: Props) {

  const {
    data: industryStockStatement = [],
    isLoading,
  } = useIndustryStockStatement(product, depositId);

  const { 
    data: deposit, 
    isLoading: isDepositLoading 
  } = useIndustryDeposit(depositId);

  const currentStock =
  industryStockStatement.length > 0
    ? industryStockStatement[0].balance
    : 0;


  const columns: ColumnDef<IndustryStockStatementItem>[] = [
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
        <IndustryMovementBadge type={row.original.type} />
      ),
    },
    {
      accessorKey: "origin",
      header: "Origem",
      cell: ({ row }) => {
        if (row.original.origin === "HARVEST") return "Colheita";
        if (row.original.origin === "SALE") return "Venda";
        if (row.original.origin === "TRANSFER") return "Transferência";
        if (row.original.origin === "DISCARD") return "Descarte"
        return "Ajuste";
      },
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Quantidade (kg)</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.type === "ENTRY" ? "+" : "-"}
          {row.original.quantity.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: () => <div className="text-right">Saldo (kg)</div>,
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
          <h1 className="text-2xl font-medium">{product}</h1>
          {deposit && (
            <p>
              Depósito: <strong>{deposit.name.toUpperCase()}</strong> | Estoque Atual:{" "}
              <strong>
                {currentStock?.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                kg
              </strong>
            </p>
          )}
        </div>
        <IndustryStockAdjustmentButton />
      </div>
      {isLoading || isDepositLoading ? (
        <AgroLoader />
      ) : (
        <IndustryStockStatementDataTable
          columns={columns}
          data={industryStockStatement}
        />
      )}
    </Card>
  );
}
