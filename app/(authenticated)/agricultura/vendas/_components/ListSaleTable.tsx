"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { IndustrySale } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { SaleDataTable } from "./SaleDataTable";
// import DeleteSaleButton from "./DeleteSaleButton";
// import EditSaleButton from "./EditSaleButton";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui
import { AgroLoader } from "@/components/agro-loader";

export function ListSaleTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado
  const [sales, setSales] = useState<IndustrySale[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchHarvests() {
    if (!selectedCycle?.id) return;

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/industry/sale?cycleId=${selectedCycle.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const filteredData = data.filter((product: IndustrySale) => product.weightLiq > 0);
      setSales(filteredData);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHarvests();
  }, [selectedCycle?.id]); // 👈 atualiza quando a safra muda

  const columns: ColumnDef<IndustrySale>[] = [
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
      accessorKey: "customer",
      header: "Cliente",
      cell: ({ row: { original } }) => original.customer.name,
    },
    {
      accessorKey: "industryTransporter",
      header: () => <div className="text-left">Transportador</div>,
      cell: ({ row }) => {
        const transportador = row.original.industryTransporter?.name;
        return (
          <div className="text-left">
            {transportador}
          </div>
        );
      },
    },
    {
      accessorKey: "weightLiq",
      header: () => <div className="text-left">Quantidade (kg)</div>,
      cell: ({ row }) => {
        const peso = row.original.weightLiq;
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
        const colheita = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            botão
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Vendas</h2>
        <Button variant={"ghost"} onClick={fetchHarvests} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <AgroLoader />
      ) : (
        <SaleDataTable columns={columns} data={sales} />
      )}
    </Card>
  );
}
