"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Purchase } from "@/types/purchase";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import UpsertPurchaseButton from "./UpsertPurchaseButton";
import DeletePurchaseButton from "./DeletePurchaseButton";
import { PurchaseDataTable } from "./PurchaseDataTable";

export function ListPurchaseTable() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPurchases() {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/insumos/purchases`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Api retornou", data);
      const filteredData = data.filter(
        (product: Purchase) => product.quantity > 0
      );
      setPurchases(filteredData);
    } catch (error) {
      console.error("Erro ao buscar compras:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPurchases();
  }, []);

  const columns: ColumnDef<Purchase>[] = [
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
      accessorKey: "product",
      header: "Produto",
      accessorFn: (row) => row.productId,
      cell: ({ row: { original } }) => original.product.name,
    },
    {
      accessorKey: "customer",
      header: "Fornecedor",
      cell: ({ row: { original: original } }) => original.customer.name,
    },
    {
      accessorKey: "invoiceNumber",
      header: "Nota Fiscal",
      cell: ({ row: { original: original } }) => original.invoiceNumber,
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-left">Quantidade</div>,
      cell: ({ row }) => {
        const peso = row.original.quantity;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(peso)}
            <span>{` ${row.original.product.unit.toLocaleLowerCase()}`}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "unitPrice",
      header: () => <div className="text-left">Preço Unitário</div>,
      cell: ({ row }) => {
        const valor = row.original.unitPrice;
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
            <UpsertPurchaseButton
              compra={compra}
              onUpdated={fetchPurchases}
            />
            <DeletePurchaseButton
              compra={compra}
              onDeleted={fetchPurchases}
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
        <Button variant={"ghost"} onClick={fetchPurchases} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <FaSpinner className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-lg">Carregando Compras...</p>
        </div>
      ) : (
        <PurchaseDataTable columns={columns} data={purchases} />
      )}
    </Card>
  );
}
