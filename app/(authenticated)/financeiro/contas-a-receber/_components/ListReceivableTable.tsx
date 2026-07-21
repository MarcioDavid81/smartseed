"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { AccountReceivable } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { ReceivableStatusButton } from "./EditReceivableStatusButton";
import { Badge } from "@/components/ui/badge";
import { ReceivableDataTable } from "./ReceivableDataTable";
import { AgroLoader } from "@/components/agro-loader";
import { useAccountReceivables } from "@/queries/financial/use-account-receivable-query";
import { LoadingData } from "@/components/loading-data";
import { formatCurrency } from "@/app/_helpers/currency";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

export function ListReceivableTable() {
  const [showReceivablePaid, setShowReceivablePaid] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("showReceivablePaid");
    if (saved) setShowReceivablePaid(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("showReceivablePaid", String(showReceivablePaid));
  }, [showReceivablePaid]);

  const {
    data: receivables = [],
    isLoading,
    isFetching,
    refetch,
  } = useAccountReceivables({
    showReceivablePaid,
  });

  const columns: ColumnDef<AccountReceivable>[] = [
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 text-left"
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
      id: "customer",
      header: () => <div className="text-left">Cliente</div>,
      accessorFn: (row) => row.customer?.name ?? "",
      filterFn: "includesString",
      cell: ({ row: { original } }) => (
        <div className="text-left">
          {original.customer ? original.customer.name : <LoadingData />}
        </div>
      ),
    },
    {
      id: "description",
      header: () => <div className="text-left">Descrição</div>,
      cell: ({ row: { original } }) => {
        return original.description;
      },
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-left">Valor (R$)</div>,
      cell: ({ row }) => {
        const amount = row.original.amount;
        return <div className="text-left">{formatCurrency(amount)}</div>;
      },
    },
    {
      id: "status",
      header: () => <div className="text-left">Status</div>,
      accessorFn: (row) => row.status,
      filterFn: "includesString",
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
        return original.receivedDate
          ? new Date(original.receivedDate).toLocaleDateString("pt-BR")
          : "-";
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const accountReceivable = row.original;
        return (
          <div className="flex justify-center gap-4">
            <ReceivableStatusButton
              accountReceivableId={accountReceivable.id}
              status={accountReceivable.status}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-light">Lista de Contas à Receber</h2>
          <Button
            variant="ghost"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              size={16}
              className={`${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Exibir pagas</span>
          <Switch
            checked={showReceivablePaid}
            onCheckedChange={setShowReceivablePaid}
          />
        </div>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <ReceivableDataTable
          columns={columns}
          data={receivables}
          sumColumnId="amount"
        />
      )}
    </Card>
  );
}
