"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Customer, Talhao } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { CustomersDataTable } from "./CustomersDataTable";
import DeleteCustomerButton from "./DeleteCustomerButton";
import EditCustomerButton from "./EditCustomerButton";
import { AgroLoader } from "@/components/agro-loader";
import { useCustomers } from "@/queries/registrations/use-customer";
import { LoadingData } from "@/components/loading-data";

export function ListCustomersTable() {

  const {
      data: customers = [],
      isLoading,
      isFetching,
      refetch,
    } = useCustomers();

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row: { original } }) => original.name,
    },
    {
      accessorKey: "cpf_cnpj",
      header: "CPF/CNPJ",
      accessorFn: (row) => row.cpf_cnpj,
      cell: ({ row: { original } }) => original.cpf_cnpj,
    },
    {
      accessorKey: "adress",
      header: "Endereço",
      accessorFn: (row) => row.adress,
      cell: ({ row: { original } }) => original.adress,
    },
    {
      accessorKey: "city",
      header: "Cidade",
      accessorFn: (row) => row.city,
      cell: ({ row: { original } }) => original.city,
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const customer = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <EditCustomerButton customer={customer} />
            <DeleteCustomerButton customer={customer} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Clientes</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <CustomersDataTable columns={columns} data={customers} />
      )}
    </Card>
  );
}
