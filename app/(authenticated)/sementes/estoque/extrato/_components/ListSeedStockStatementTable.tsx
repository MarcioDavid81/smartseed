"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { AgroLoader } from "@/components/agro-loader";
import { SeedStockStatementItem } from "@/types";
import { SeedMovementBadge } from "./SeedMovementBadge";
import { PRODUCT_TYPE_LABELS } from "@/app/(authenticated)/_constants/products";
import { useSeedCultivarById } from "@/queries/seed/use-seed-cultivar-query";
import { useSeedStockStatement } from "@/queries/seed/use-seed-stock-statement";
import { SeedStockStatementDataTable } from "./SeedStockStatementDataTable";

type Props = {
  cultivarId: string;
};

export function ListSeedStockStatementTable({
  cultivarId,
}: Props) {

  const {
    data: seedStockStatement = [],
    isLoading,
    isError,
    error,
  } = useSeedStockStatement(cultivarId);

  const { data: cultivar } = useSeedCultivarById(cultivarId);



  const currentStock =
  seedStockStatement.length > 0
    ? seedStockStatement[0].balance
    : 0;


  const columns: ColumnDef<SeedStockStatementItem>[] = [
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
        <SeedMovementBadge type={row.original.type} />
      ),
    },
    {
      accessorKey: "origin",
      header: "Origem",
      cell: ({ row }) => {
        if (row.original.origin === "HARVEST") return "Colheita";
        if (row.original.origin === "BUY") return "Compra";
        if (row.original.origin === "SALE") return "Venda";
        if (row.original.origin === "CONSUMPTION") return "Plantio";
        if (row.original.origin === "BENEFICIATION") return "Descarte";
        if (row.original.origin === "ADJUSTMENT") return "Ajuste";
        return "Transformação";
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
          <h1 className="text-2xl font-medium">
            {cultivar?.product ? PRODUCT_TYPE_LABELS[cultivar.product].toUpperCase() : "—"}
          </h1>
          <p>
            Cultivar: <strong>{cultivar?.name?.toUpperCase() ?? "—"}</strong> | Estoque Atual:{" "}
            <strong>
              {currentStock?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}{" "}
              kg
            </strong>
          </p>

        </div>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : isError ? (
        <div className="text-sm text-muted-foreground">
          Não foi possível carregar o extrato.
        </div>
      ) : (
        <SeedStockStatementDataTable
          columns={columns}
          data={seedStockStatement}
          productLabel={cultivarId}
        />
      )}
    </Card>
  );
}
