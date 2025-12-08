"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { AgroLoader } from "@/components/agro-loader";
import { IndustryStockStatementDataTable } from "./IndustryStockStatementDataTable";
import { IndustryStockStatementItem } from "@/types";
import { IndustryMovementBadge } from "./IndustryMovementBadge";

type Props = {
  product: string;
  depositId: string;
};

export function ListIndustryStockStatementTable({
  product,
  depositId,
}: Props) {
  const [data, setData] = useState<IndustryStockStatementItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchStatement() {
    try {
      const token = getToken();
      const params = new URLSearchParams({
        product,
        depositId,
      });

      const res = await fetch(
        `/api/industry/stock-statement?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Erro ao buscar extrato:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatement();
  }, [product, depositId]);

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
        return "Transferência";
      },
    },
    {
      accessorKey: "description",
      header: "Descrição",
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
      <div className="mb-4">
        <h2 className="font-light">Extrato de Movimentações</h2>
      </div>

      {loading ? (
        <AgroLoader />
      ) : (
        <IndustryStockStatementDataTable
          columns={columns}
          data={data}
          searchFields={["description", "origin"]}
        />
      )}
    </Card>
  );
}
