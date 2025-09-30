"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { AccountPayable, AccountReceivable } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { useReceivable } from "@/contexts/ReceivableContext";
import { ReceivableStatusButton } from "./EditReceivableStatusButton";
import { Badge } from "@/components/ui/badge";
import { ReceivableDataTable } from "./ReceivableDataTable";

export function ListReceivableTable() {
  const [newReceivables, setNewReceivables] = useState<AccountReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const { receivables, isLoading } = useReceivable();

  async function fetchReceivables() {
    try {
      const token = getToken();
      const res = await fetch("/api/financial/receivables", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setNewReceivables(data);
    } catch (error) {
      console.error("Erro ao buscar contas a receber:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReceivables();
  }, []);

  const columns: ColumnDef<AccountReceivable>[] = [
    {
      accessorKey: "description",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Descrição
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data de Vencimento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row: { original } }) => {
        return new Date(original.dueDate).toLocaleDateString("pt-BR");
      },
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-left">Valor (R$)</div>,
      cell: ({ row }) => {
        const amount = row.original.amount;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-left">Status</div>,
      cell: ({ row }) => {
        const status = row.original.status;
        
        const getStatusStyle = (status: string) => {
          switch (status) {
            case "PENDING":
              return "bg-yellow-500 text-white rounded-full text-xs font-light hover:bg-opacity-90";
            case "PAID":
              return "bg-green text-white rounded-full text-xs font-light hover:bg-opacity-90";
            case "OVERDUE":
              return "bg-red text-white rounded-full text-xs font-light hover:bg-opacity-90";
            case "CANCELED":
              return "bg-gray-500 text-white rounded-full text-xs font-light hover:bg-opacity-90";
            default:
              return "bg-gray-400 text-white rounded-full text-xs font-light hover:bg-opacity-90";
          }
        };

        const getStatusLabel = (status: string) => {
          switch (status) {
            case "PENDING":
              return "Pendente";
            case "PAID":
              return "Pago";
            case "OVERDUE":
              return "Vencido";
            case "CANCELED":
              return "Cancelado";
            default:
              return status;
          }
        };

        return (
          <Badge className={getStatusStyle(status)}>
            {getStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "paymentDate",
      header: () => <div className="text-left">Data de Pagamento</div>,
      cell: ({ row: { original } }) => {
        return original.receivedDate ? new Date(original.receivedDate).toLocaleDateString("pt-BR") : "-";
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const accountReceivable = row.original;
        return (
          <div className="flex justify-center gap-2">
            <ReceivableStatusButton accountReceivableId={accountReceivable.id} status={accountReceivable.status} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="mb-4">
        <h2 className="font-medium">Contas a Receber</h2>
      </div>
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">
          <FaSpinner className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-lg">Carregando Contas a Receber...</p>
        </div>
      ) : (
        <ReceivableDataTable columns={columns} data={newReceivables} />
      )}
    </Card>
  );
}
