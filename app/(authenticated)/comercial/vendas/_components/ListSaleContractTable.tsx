"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { SaleContractDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { AgroLoader } from "@/components/agro-loader";
import { LoadingData } from "@/components/loading-data";
import { useSaleContracts } from "@/queries/commercial/use-sale-contracts";
import { SaleContractDataTable } from "./SaleContractDataTable";
import EditSaleContractButton from "./EditSaleContractButton";
import DeleteSaleContractButton from "./DeleteSaleContractButton";
import { CommercialStatusBadge } from "@/app/(authenticated)/_components/CommercialStatusBadge";
import { DetailSaleContractButton } from "./DetailSaleContractButton";
import { PRODUCT_TYPE_LABELS } from "@/app/(authenticated)/_constants/products";

export function ListSaleContractTable() {

  const {
      data: saleContracts = [],
      isLoading,
      isFetching,
      refetch,
    } = useSaleContracts();

  const columns: ColumnDef<SaleContractDetails>[] = [
    {
      accessorKey: "document",
      header: "Documento",
      accessorFn: (row) => row.document,
      cell: ({ row: { original } }) => original.document,
    },
    {
      id: "customer",
      header: "Cliente",
      accessorFn: (row) => row.customer?.name ?? "",
      filterFn: "includesString",
      cell: ({ row: { original } }) => <div className="text-left">{original.customer?.name ? (original.customer.name) : <LoadingData />}</div>,
    },
    {
      id: "product",
      header: () => <div className="text-left">Itens</div>,
      cell: ({ row }) => {
        const { items, type } = row.original;

        if (!items.length) return "-";

        const labels =
          type === "INDUSTRY_SALE"
            ? items
                .map(item => PRODUCT_TYPE_LABELS[item.product ?? "SOJA"])
                .filter(Boolean)
            : items
                .map(item => item.cultivar?.name)
                .filter(Boolean);

        return (
          <div className="text-left">
            {labels.join(", ")}
          </div>
        );
      },
    },
    {
      id: "quantity",
      header: () => <div className="text-left">Quantidade</div>,
      accessorFn: (row) =>
        row.items.reduce((acc, item) => acc + Number(item.quantity), 0),
      cell: ({ row }) => {
        const quantity = Number(row.getValue("quantity"));
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(quantity)}
          </div>
        );
      },
    },
    {
      id: "fulfilledQuantity",
      header: () => <div className="text-left">Entregas</div>,
      accessorFn: (row) =>
        row.items.reduce((acc, item) => acc + Number(item.fulfilledQuantity), 0),
      cell: ({ row }) => {
        const fulfilledQuantity = Number(row.getValue("fulfilledQuantity"));
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(fulfilledQuantity)}
          </div>
        );
      },
    },
    {
      id: "remainingQuantity",
      header: () => <div className="text-left">Saldo</div>,
      accessorFn: (row) =>
        row.items.reduce((acc, item) => acc + Number(item.quantity) - Number(item.fulfilledQuantity), 0),
      cell: ({ row }) => {
        const remainingQuantity = Number(row.getValue("remainingQuantity"));
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(remainingQuantity)}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const venda = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <DetailSaleContractButton venda={venda} />
            <EditSaleContractButton venda={venda} />
            <DeleteSaleContractButton venda={venda} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Contratos de Venda</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <SaleContractDataTable columns={columns} data={saleContracts} sumColumnId="quantity" />
      )}
    </Card>
  );
}
