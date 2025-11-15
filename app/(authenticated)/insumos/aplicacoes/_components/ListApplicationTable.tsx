"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui
import { getToken } from "@/lib/auth-client";
import { Application } from "@/types/application";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { ApplicationDataTable } from "./ApplicationDataTable";
import DeleteApplicationButton from "./DeleteApplicationButton";
import UpsertApplicationButton from "./UpsertApplicationButton";
import { AgroLoader } from "@/components/agro-loader";

export function ListApplicationTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado
  const [aplicacoes, setAplicacoes] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchApplications() {
    if (!selectedCycle?.id) return;

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `/api/insumos/applications?cycleId=${selectedCycle.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      const filteredData = data.filter(
        (product: Application) => product.quantity > 0,
      );
      setAplicacoes(filteredData);
    } catch (error) {
      console.error("Erro ao buscar aplicações:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, [selectedCycle?.id]); // 👈 atualiza quando a safra muda

  const columns: ColumnDef<Application>[] = [
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
      accessorFn: (row) => row.productStock.product.name,
      cell: ({ row: { original } }) => original.productStock.product.name,
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
            <span>{` ${row.original.productStock.product.unit.toLocaleLowerCase()}`}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "talhao",
      header: "Destino",
      accessorFn: (row) => row.talhao.name,
      cell: ({ row: { original } }) => original.talhao.name,
    },
    {
      accessorKey: "area",
      header: () => <div className="text-left">Área (ha)</div>,
      cell: ({ row }) => {
        const area = row.original.talhao.area;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(area)}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const aplicacao = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <UpsertApplicationButton
              aplicacao={aplicacao}
              onUpdated={fetchApplications}
            />
            <DeleteApplicationButton
              aplicacao={aplicacao}
              onDeleted={fetchApplications}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="mb-2 flex items-center gap-2">
        <h2 className="font-light">Lista de Aplicações</h2>
        <Button
          variant={"ghost"}
          onClick={fetchApplications}
          disabled={loading}
        >
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <AgroLoader />
      ) : (
        <ApplicationDataTable columns={columns} data={aplicacoes} />
      )}
    </Card>
  );
}
