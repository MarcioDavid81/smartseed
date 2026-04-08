"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { AccountPayable } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { PayableDataTable } from "./PayableDataTble";
import { PayableStatusButton } from "./EditPayableStatusButton";
import { Badge } from "@/components/ui/badge";
import { AgroLoader } from "@/components/agro-loader";
import { useAccountPayables } from "@/queries/financial/use-account-payables-query";
import { LoadingData } from "@/components/loading-data";
import { formatCurrency } from "@/app/_helpers/currency";

export function ListPayableTable() {
  
  const {
    data: payables = [],
    isLoading,
    isFetching,
    refetch,
  } = useAccountPayables();

  const columns: ColumnDef<AccountPayable>[] = [
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
      id: "customer",
      header: () => <div className="text-left">Cliente</div>,
      accessorFn: (row) => row.customer?.name ?? "",
      filterFn: "includesString",
      cell: ({ row: { original } }) => <div className="text-left">{original.customer ? (original.customer.name) : <LoadingData />}</div>,
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
        return (
          <div className="text-left">
            {formatCurrency(amount)}
          </div>
        );
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
        return original.paymentDate ? new Date(original.paymentDate).toLocaleDateString("pt-BR") : "-";
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const accountPayable = row.original;
        return (
          <div className="flex justify-center gap-2">
            <PayableStatusButton accountPayableId={accountPayable.id} status={accountPayable.status} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Contas à Pagar</h2>
        <Button variant="ghost" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <PayableDataTable columns={columns} data={payables} sumColumnId="amount" />
      )}
    </Card>
  );
}
