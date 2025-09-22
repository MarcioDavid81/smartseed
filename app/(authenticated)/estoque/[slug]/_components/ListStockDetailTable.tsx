"use client";

import { tipoMovimentacaoInfo } from "@/app/_helpers/movimentacao";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStock } from "@/contexts/StockContext";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import DeleteMovementButton from "./DeleteMovementButton";
import { StockDetailDataTable } from "./StockDetailDataTable";

interface Cultivar {
  name: string;
  product: string;
  stock: number;
}

interface Movement {
  id: string;
  date: string;
  quantity: number;
  type: string;
}

interface ListStockDetailTableProps {
  allMovements: Movement[];
  cultivar: Cultivar;
}

export function ListStockDetailTable({ allMovements, cultivar }: ListStockDetailTableProps) {
  const [movements, setMovements] = useState(allMovements);
  const [isLoading, setIsLoading] = useState(false);

  const calcularEstoque = (movs: Movement[]) => {
    return movs.reduce((total, mov) => {
        const isEntrada = ["colheita", "compra"].includes(
          mov.type?.toLowerCase()
        );
        return isEntrada ? total + mov.quantity : total - mov.quantity;
      }, 0);
    };
  
    const estoqueAtual = calcularEstoque(movements);
  
    const atualizarEstoque = () => {
      setIsLoading(true);
      try {
        window.location.reload();
      } catch (error) {
        console.error("Erro ao atualizar o estoque:", error);
      } finally {
        setIsLoading(false);
      }    
    };

  function renderTipoMovimentacao(tipo: string) {
    const info = tipoMovimentacaoInfo[tipo.toUpperCase()];
    if (!info) return tipo;

    const Icon = info.entrada ? ArrowUp : ArrowDown;
    const color = info.entrada ? "text-green-600" : "text-red-600";

    return (
      <div className="flex items-center gap-1">
        <span>{info.label}</span>
        <Icon size={16} className={color} />
      </div>
    );
  }

  const [movementsState, setMovementsState] = useState(movements);

  const { fetchCultivars } = useStock();

  const handleDelete = async (id: string) => {
    setMovementsState((prev) => prev.filter((mov) => mov.id !== id));
    await fetchCultivars();
  };

  const columns: ColumnDef<Movement>[] = [
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
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Tipo de Movimentação",
      accessorFn: (row) => row.type,
      cell: ({ row }) => {
        return <div className="whitespace-nowrap">{renderTipoMovimentacao(row.original.type)}</div>;
      },
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Ação</div>,
      cell: ({ row }) => {
        const mov = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <DeleteMovementButton
              id={mov.id}
              tipo={mov.type}
              quantidade={mov.quantity}
              onDeleted={() => handleDelete(mov.id)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary">
      {isLoading ? (
        <div className="py-10 text-center text-gray-500">
          <FaSpinner className="mx-auto mb-2 animate-spin" size={24} />
          <p className="text-lg">Carregando extrato...</p>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-medium">{cultivar.product}</h1>
      <div className="flex items-center gap-2">
        <p>
          Cultivar: {cultivar.name} | Estoque Atual:{" "}
          {new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(estoqueAtual)}{" "}
          kg
        </p>
        <Button variant={"ghost"} onClick={atualizarEstoque} disabled={isLoading}>
          <RefreshCw size={16} className={`${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <h2 className="text-xl font-medium mt-4">Movimentações</h2>
      {movements.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhuma movimentação encontrada.
        </p>
      ) : (
          <StockDetailDataTable columns={columns} data={movementsState} />
      )}
        </div>
      )}
    </Card>
  );
}
