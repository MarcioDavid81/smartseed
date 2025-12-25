"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { IndustryTransporter } from "@/types";
import EditIndustryTransporterButton from "./EditTransporterButton";
import DeleteIndustryTransporterButton from "./DeleteTransporterButton";
import { IndustryTransporterDataTable } from "./TransporterDataTable";
import { AgroLoader } from "@/components/agro-loader";
import { useIndustryTransporters } from "@/queries/industry/use-transporter-query";



export function IndustryTransporterGetTable() {
  
  const {
        data: transporters = [],
        isLoading,
        isFetching,
        refetch,
      } = useIndustryTransporters();

  const columns: ColumnDef<IndustryTransporter>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "cpf_cnpj",
      header: "CPF/CNPJ",
    },
    {
      accessorKey: "phone",
      header: "Telefone",
    },
    {
      accessorKey: "email",
      header: "E-mail",
    },
    {
      accessorKey: "city",
      header: "Cidade",
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center justify-center gap-4">
            <EditIndustryTransporterButton industryTransporter={product} />
            <DeleteIndustryTransporterButton industryTransporter={product} />
          </div>
        );
      },
    },
  ];  

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Transportadores</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <IndustryTransporterDataTable columns={columns} data={transporters} />
      )}
    </Card>
  );
}
