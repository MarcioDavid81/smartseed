"use client";

import { useState } from "react";
import { tipoMovimentacaoInfo } from "@/app/_helpers/movimentacao";
import { ArrowUp, ArrowDown } from "lucide-react";
import DeleteMovementButton from "./DeleteMovementButton";
import { useStock } from "@/contexts/StockContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableCell, TableRow } from "@/components/ui/table";
import { getMovimentacaoDirection } from "@/app/_helpers/getMovimentacaoDirection";

export default function EstoqueTableBody({ movements }: { movements: any[] }) {
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


  const [movementsState, setMovementsState] = useState(movements);

  const { fetchCultivars } = useStock();

  const handleDelete = async (id: string) => {
    setMovementsState((prev) => prev.filter((mov) => mov.id !== id));
    await fetchCultivars();
  };

  return (
    <>
      {movementsState.map((mov) => {
        return (
          <TableRow key={mov.id} className="bg-white border-b hover:bg-gray-50">
            <TableCell className="px-6 py-2">
              {new Date(mov.date).toLocaleDateString()}
            </TableCell>
            <TableCell className="px-6 py-2">
              {new Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(mov.quantity)}
            </TableCell>
            <TableCell className="whitespace-nowrap px-6 py-2">
              {renderTipoMovimentacao(mov.type, mov.quantity)}
            </TableCell>
            <TableCell className="flex items-center justify-center gap-4 px-6 py-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DeleteMovementButton
                      id={mov.id}
                      tipo={mov.type}
                      quantidade={mov.quantity}
                      onDeleted={() => handleDelete(mov.id)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Excluir</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
