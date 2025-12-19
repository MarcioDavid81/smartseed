"use client";

import { tipoMovimentacaoInfo } from "@/app/_helpers/movimentacao";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import DeleteMovementButton from "./DeleteMovementButton";
import { StockDetailDataTable } from "./StockDetailDataTable";
import { getMovimentacaoDirection } from "@/app/_helpers/getMovimentacaoDirection";
import SeedStockAdjustmentButton from "./SeedStockAdjustmentButton";

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



export function ListStockDetailTable({
  allMovements,
  cultivar,
}: ListStockDetailTableProps) {
  const [movements, setMovements] = useState(allMovements);

  function renderTipoMovimentacao(tipo: string, quantidade: number) {
  const info = tipoMovimentacaoInfo[tipo.toUpperCase()];
  if (!info) return tipo;

  const direction = getMovimentacaoDirection(tipo, quantidade);
  const Icon = direction === "entrada" ? ArrowUp : ArrowDown;
  const color = direction === "entrada" ? "text-green" : "text-red";

  return (
    <div className="flex items-center gap-1">
      <span>{info.label}</span>
      <Icon size={16} className={color} />
    </div>
  );
}


  const handleDelete = (id: string) => {
    setMovements((prev) => prev.filter((mov) => mov.id !== id));
  };

  const columns: ColumnDef<Movement>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 text-left"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        new Date(row.original.date).toLocaleDateString("pt-BR"),
    },
    {
      accessorKey: "quantity",
      header: "Quantidade",
      cell: ({ row }) =>
        new Intl.NumberFormat("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(row.original.quantity),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) =>
        renderTipoMovimentacao(row.original.type, row.original.quantity),
    },
    {
      accessorKey: "action",
      header: "Ação",
      cell: ({ row }) => (
        <DeleteMovementButton
          id={row.original.id}
          tipo={row.original.type}
          quantidade={row.original.quantity}
          onDeleted={() => handleDelete(row.original.id)}
        />
      ),
    },
  ];

  return (
    <Card className="p-4 font-light dark:bg-primary space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">{cultivar.product}</h1>
          <p>
            Cultivar: {cultivar.name} | Estoque Atual:{" "}
            <strong>
              {new Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(cultivar.stock)}{" "}
              kg
            </strong>
          </p>
        </div>
        <SeedStockAdjustmentButton />
      </div>

      <StockDetailDataTable columns={columns} data={movements} />
    </Card>
  );
}
