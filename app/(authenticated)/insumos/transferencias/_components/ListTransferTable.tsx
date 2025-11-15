"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getToken } from "@/lib/auth-client";
import { Transfer } from "@/types/transfer";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import DeleteTransferButton from "./DeleteTransferButton";
import { TransferDataTable } from "./TransferDataTable";
import UpsertTransferButton from "./UpsertTransferButton";
import { AgroLoader } from "@/components/agro-loader";

export function ListTransferTable() {
  const [transferencias, setTransferencias] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTransfers() {

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        "/api/insumos/transfers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      const filteredData = data.filter(
        (product: Transfer) => product.quantity > 0,
      );
      setTransferencias(filteredData);
    } catch (error) {
      console.error("Erro ao buscar transferências:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransfers();
  }, []);

  const columns: ColumnDef<Transfer>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 text-left"
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
      accessorFn: (row) => row.product.name,
      cell: ({ row: { original } }) => original.product.name,
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
      accessorKey: "origem",
      header: "Depósito de Origem",
      accessorFn: (row) => row.originFarm.name,
      cell: ({ row: { original } }) => original.originFarm.name,
    },
    {
      accessorKey: "destino",
      header: "Depósito de Destino",
      accessorFn: (row) => row.destFarm.name,
      cell: ({ row: { original } }) => original.destFarm.name,
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const transferencias = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <UpsertTransferButton
              transferencia={transferencias}
              onUpdated={fetchTransfers}
            />
            <DeleteTransferButton
              transferencia={transferencias}
              onDeleted={fetchTransfers}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="font-light">Lista de Transferências</h2>
        <Button
          variant={"ghost"}
          onClick={fetchTransfers}
          disabled={loading}
        >
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <AgroLoader />
      ) : (
        <TransferDataTable columns={columns} data={transferencias} />
      )}
    </Card>
  );
}
