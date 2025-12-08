"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { IndustryDeposit } from "@/types";
import EditIndustryDepositButton from "./EditDepositButton";
import DeleteIndustryDepositButton from "./DeleteDepositButton";
import { IndustryDepositDataTable } from "./DepositDataTable";
import { formatNumber } from "@/app/_helpers/currency";
import { AgroLoader } from "@/components/agro-loader";
import { ProductType } from "@prisma/client";
import { getProductLabel } from "@/app/_helpers/getProductLabel";

type FlattenedDeposit = {
  id: string;
  name: string;
  product: string;
  quantity: number;
};

export function IndustryDepositGetTable() {
  const [industryDeposit, setIndustryDeposit] = useState<IndustryDeposit[]>([]);
  const [flattenedDeposits, setFlattenedDeposits] = useState<FlattenedDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDeposits() {
    try {
      const token = getToken();
      const res = await fetch("/api/industry/deposit", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const deposits: IndustryDeposit[] = await res.json();
      console.table(deposits);

      setIndustryDeposit(deposits);

      const flattened = deposits.flatMap((deposit) => {
        if (deposit.industryStocks.length === 0) {
          return [
            {
              id: deposit.id,
              name: deposit.name,
              product: "SEM PRODUTO",
              quantity: 0,
            },
          ];
        }

        return deposit.industryStocks.map((stock) => ({
          id: deposit.id,
          name: deposit.name,
          product: stock.product,
          quantity: Number(stock.quantity),
        }));
      });

      setFlattenedDeposits(flattened);
    } catch (error) {
      console.error("Erro ao buscar depósitos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDeposits();
  }, []);

  const columns: ColumnDef<FlattenedDeposit>[] = [
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
      accessorKey: "product",
      header: () => <div className="text-center">Produto</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.product !== "SEM PRODUTO"
            ? getProductLabel(row.original.product as ProductType)
            : <span className="text-gray-500">Sem Produto</span>}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-center">Estoque</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.quantity > 0
            ? formatNumber(row.original.quantity)
            : <span className="text-gray-500">Sem Estoque</span>}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const { id } = row.original;

        // 👇 Busca o depósito original pelo ID
        const originalDeposit = industryDeposit.find((d) => d.id === id);

        if (!originalDeposit) return null;

        return (
          <div className="flex items-center justify-center gap-4">
            <EditIndustryDepositButton
              industryDeposit={originalDeposit}
              onUpdated={fetchDeposits}
            />
            <DeleteIndustryDepositButton
              industryDeposit={originalDeposit}
              onDeleted={fetchDeposits}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Depósitos</h2>
        <Button variant="ghost" onClick={fetchDeposits} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <AgroLoader />
      ) : (
        <IndustryDepositDataTable columns={columns} data={flattenedDeposits} />
      )}
    </Card>
  );
}
