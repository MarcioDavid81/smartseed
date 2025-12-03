"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { IndustrySale, IndustryTransfer } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
// import DeleteSaleButton from "./DeleteSaleButton";
// import EditSaleButton from "./EditSaleButton";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui
import { AgroLoader } from "@/components/agro-loader";
import { TransferDataTable } from "./TransferDataTable";
import EditTransferButton from "./EditTransferButton";
import DeleteTransferButton from "./DeleteTransferButton";

export function ListTransferTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado
  const [transfers, setTransfers] = useState<IndustryTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTransfers() {
    if (!selectedCycle?.id) return;

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/industry/transfer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const filteredData = data.filter((product: IndustryTransfer) => product.quantity > 0);
      setTransfers(filteredData);
    } catch (error) {
      console.error("Erro ao buscar transferências:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransfers();
  }, [selectedCycle?.id]); // 👈 atualiza quando a safra muda

  const columns: ColumnDef<IndustryTransfer>[] = [
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
      cell: ({ row: { original } }) => new Date(original.date).toLocaleDateString("pt-BR"),
    },
    {
      accessorKey: "document",
      header: "Documento",
      accessorFn: (row) => row.document,
      cell: ({ row: { original } }) => original.document,
    },
    {
      accessorKey: "fromDeposit",
      header: "Depósito Origem",
      cell: ({ row: { original } }) => original.fromDeposit.name,
    },
    {
      accessorKey: "toDeposit",
      header: () => <div className="text-left">Depósito de Destino</div>,
      cell: ({ row }) => {
        const toDeposit = row.original.toDeposit?.name;
        return (
          <div className="text-left">
            {toDeposit}
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-left">Quantidade (kg)</div>,
      cell: ({ row }) => {
        const peso = row.original.quantity;
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
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const transferencia = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <EditTransferButton transferencia={transferencia} onUpdated={fetchTransfers} />
            <DeleteTransferButton transferencia={transferencia} onDeleted={fetchTransfers} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Transferências</h2>
        <Button variant={"ghost"} onClick={fetchTransfers} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <AgroLoader />
      ) : (
        <TransferDataTable columns={columns} data={transfers} />
      )}
    </Card>
  );
}
