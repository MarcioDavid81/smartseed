"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { IndustryTransfer } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { AgroLoader } from "@/components/agro-loader";
import { TransferDataTable } from "./TransferDataTable";
import EditTransferButton from "./EditTransferButton";
import DeleteTransferButton from "./DeleteTransferButton";
import { useIndustryTransfers } from "@/queries/industry/use-transfers-query";
import { getProductLabel } from "@/app/_helpers/getProductLabel";
import { ProductType } from "@prisma/client";

export function ListTransferTable() {

  const {
      data: industryTransfers = [],
      isLoading,
      isFetching,
      refetch,
    } = useIndustryTransfers();

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
      accessorKey: "product",
      header: "Produto",
      accessorFn: (row) => row.product,
      cell: ({ row: { original } }) => getProductLabel(original.product as ProductType),
    },
    {
      accessorKey: "document",
      header: "Documento",
      accessorFn: (row) => row.document,
      cell: ({ row: { original } }) => original.document || "-",
    },
    {
      accessorKey: "fromDeposit",
      header: "Depósito Origem",
      cell: ({ row: { original } }) => original.fromDeposit?.name || "-",
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
            <EditTransferButton transferencia={transferencia} />
            <DeleteTransferButton transferencia={transferencia} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Transferências</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <TransferDataTable columns={columns} data={industryTransfers} sumColumnId="quantity" />
      )}
    </Card>
  );
}
