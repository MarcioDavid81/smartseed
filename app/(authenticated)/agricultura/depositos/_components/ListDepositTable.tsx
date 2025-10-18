"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { IndustryDeposit } from "@/types";
import EditIndustryDepositButton from "./EditDepositButton";
import DeleteIndustryDepositButton from "./DeleteDepositButton";
import { IndustryDepositDataTable } from "./DepositDataTable";
import { formatNumber } from "@/app/_helpers/currency";

// 👇 Novo tipo flattenado
type FlattenedDeposit = {
  id: string;
  name: string;
  product: string;
  quantity: number;
};

export function IndustryDepositGetTable() {
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

      // 👇 Flatten dos depósitos e produtos
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
        <div className="text-center">{row.original.product}</div>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-center">Estoque</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.quantity > 0
            ? formatNumber(row.original.quantity)
            : <span className="text-xs text-gray-500">SEM ESTOQUE</span>}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const { id, name } = row.original;
        // ⚠️ Aqui você precisa passar o depósito original,
        // então podemos buscar no estado original ou adaptar conforme necessidade.
        return (
          <div className="flex items-center justify-center gap-4">
            <EditIndustryDepositButton
              industryDeposit={{ id, name } as IndustryDeposit} // ou mapeie corretamente
              onUpdated={fetchDeposits}
            />
            <DeleteIndustryDepositButton
              industryDeposit={{ id, name } as IndustryDeposit}
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
        <div className="py-10 text-center text-gray-500">
          <FaSpinner className="mx-auto mb-2 animate-spin" size={24} />
          <p className="text-lg">Carregando Depósitos...</p>
        </div>
      ) : (
        <IndustryDepositDataTable columns={columns} data={flattenedDeposits} />
      )}
    </Card>
  );
}
