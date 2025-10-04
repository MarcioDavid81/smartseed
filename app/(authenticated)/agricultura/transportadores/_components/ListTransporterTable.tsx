"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { IndustryTransporter } from "@/types";
import EditIndustryTransporterButton from "./EditTransporterButton";
import DeleteIndustryTransporterButton from "./DeleteTransporterButton";
import { IndustryTransporterDataTable } from "./TransporterDataTable";



export function IndustryTransporterGetTable() {
  const [industryTransporter, setIndustryTransporter] = useState<IndustryTransporter[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTransporters() {
    try {
      const token = getToken();
      const res = await fetch("/api/industry/transporter", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.table(data);
      setIndustryTransporter(data);
    } catch (error) {
      console.error("Erro ao buscar transportadores:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransporters();
  }, []);

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
            <EditIndustryTransporterButton industryTransporter={product} onUpdated={fetchTransporters} />
            <DeleteIndustryTransporterButton industryTransporter={product} onDeleted={fetchTransporters} />
          </div>
        );
      },
    },
  ];  

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Transportadores</h2>
        <Button variant={"ghost"} onClick={fetchTransporters} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <div className="py-10 text-center text-gray-500">
          <FaSpinner className="mx-auto mb-2 animate-spin" size={24} />
          <p className="text-lg">Carregando Produtos...</p>
        </div>
      ) : (
        <IndustryTransporterDataTable columns={columns} data={industryTransporter} />
      )}
    </Card>
  );
}
