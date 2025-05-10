"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Buy } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import UpsertBuyButton from "./UpsertBuyButton";
import DeleteBuyButton from "@/app/(authenticated)/estoque/_components/DeleteBuyButton";
import { BuyDataTable } from "./BuyDataTable";

export function ListBuyTable() {
  const [buys, setBuys] = useState<Buy[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBuys() {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/buys", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const filteredData = data.filter(
        (product: Buy) => product.quantityKg > 0
      );
      setBuys(filteredData);
    } catch (error) {
      console.error("Erro ao buscar compras:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBuys();
  }, []);

  const columns: ColumnDef<Buy>[] = [
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
      cell: ({ row: { original } }) => {
        return new Date(original.date).toLocaleDateString("pt-BR");
      },
    },
    {
      accessorKey: "cultivar",
      header: "Cultivar",
      accessorFn: (row) => row.cultivarId,
      cell: ({ row: { original } }) => original.cultivar.name,
    },
    {
      accessorKey: "customer",
      header: "Fornecedor",
      cell: ({ row: { original: original } }) => original.customer.name,
    },
    {
      accessorKey: "invoice",
      header: "Nota Fiscal",
      cell: ({ row: { original: original } }) => original.invoice,
    },
    {
      accessorKey: "quantityKg",
      header: () => <div className="text-left">Quantidade (kg)</div>,
      cell: ({ row }) => {
        const peso = row.original.quantityKg;
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
      accessorKey: "unityPrice",
      header: () => <div className="text-left">Preço (kg)</div>,
      cell: ({ row }) => {
        const valor = row.original.unityPrice;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(valor)}
          </div>
        );
      },
    },
    {
      accessorKey: "totalPrice",
      header: () => <div className="text-left">Preço Total</div>,
      cell: ({ row }) => {
        const valor = row.original.totalPrice;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(valor)}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const compra = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <UpsertBuyButton
              compra={compra}
              onUpdated={fetchBuys}
            />
            <DeleteBuyButton
              compra={compra}
              onDeleted={fetchBuys}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Compras</h2>
        <Button variant={"ghost"} onClick={fetchBuys} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <FaSpinner className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-lg">Carregando Compras...</p>
        </div>
      ) : (
        <BuyDataTable columns={columns} data={buys} />
      )}
    </Card>
  );
}
