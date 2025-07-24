"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaSpinner } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { getToken } from "@/lib/auth-client";
import { SaleDataTable } from "./SaleDataTable";
import DeleteSaleButton from "./DeleteSaleButton";
import UpsertSaleButton from "./UpsertSaleButton";
import { Sale } from "@/types/sale";
import { useCycle } from "@/contexts/CycleContext"; // 👈 aqui

export function ListSaleTable() {
  const { selectedCycle } = useCycle(); // 👈 pegando ciclo selecionado
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSales() {
    if (!selectedCycle?.id) return;

    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/sales?cycleId=${selectedCycle.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const filteredData = data.filter(
        (product: Sale) => product.quantityKg > 0
      );
      setSales(filteredData);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSales();
  }, [selectedCycle?.id]); // 👈 atualiza quando a safra muda

  const columns: ColumnDef<Sale>[] = [
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
      cell: ({ row: { original } }) => {
        return new Date(original.date).toLocaleDateString("pt-BR");
      },
    },
    {
      accessorKey: "cultivar",
      header: "Cultivar",
      accessorFn: (row) => row.cultivarId,
      cell: ({ row: { original } }) => original.cultivar.name,
    },
    {
      accessorKey: "customer",
      header: "Cliente",
      cell: ({ row: { original: original } }) => original.customer.name,
    },
    {
      accessorKey: "invoiceNumber",
      header: "Nota Fiscal",
      cell: ({ row: { original: original } }) => original.invoiceNumber,
    },
    {
      accessorKey: "quantityKg",
      header: () => <div className="text-left">Quantidade (kg)</div>,
      cell: ({ row }) => {
        const peso = row.original.quantityKg;
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
      accessorKey: "saleValue",
      header: () => <div className="text-left">Valor da Venda</div>,
      cell: ({ row }) => {
        const valor = row.original.saleValue;
        return (
          <div className="text-left">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(valor ?? 0)}
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
            <UpsertSaleButton
              venda={venda}
              onUpdated={fetchSales}
            />
            <DeleteSaleButton
              venda={venda}
              onDeleted={fetchSales}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Vendas</h2>
        <Button variant={"ghost"} onClick={fetchSales} disabled={loading}>
          <RefreshCw size={16} className={`${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          <FaSpinner className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-lg">Carregando Vendas...</p>
        </div>
      ) : (
        <SaleDataTable columns={columns} data={sales} />
      )}
    </Card>
  );
}
