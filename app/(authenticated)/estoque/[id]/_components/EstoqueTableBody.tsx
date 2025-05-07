"use client";

import { useState } from "react";
import { tipoMovimentacaoInfo } from "@/app/_helpers/movimentacao";
import { ArrowUp, ArrowDown, SquarePen } from "lucide-react";
import DeleteMovementButton from "./DeleteMovementButton";  

export default function EstoqueTableBody({ movements }: { movements: any[] }) {
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

  const handleDelete = (id: string) => {
    setMovementsState((prev) => prev.filter((mov) => mov.id !== id));
  };

  return (
    <>
      {movementsState.map((mov) => {
        return (
          <tr key={mov.id} className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4">
              {new Date(mov.date).toLocaleDateString()}
            </td>
            <td className="px-6 py-4">
              {new Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(mov.quantity)}
            </td>
            <td className="whitespace-nowrap px-6 py-4">
              {renderTipoMovimentacao(mov.type)}
            </td>
            <td className="flex items-center justify-start gap-4 px-6 py-4">
              <button>
                <SquarePen className="text-green" size={18} />
              </button>
              <DeleteMovementButton
                id={mov.id}
                tipo={mov.type}
                quantidade={mov.quantity}
                onDeleted={() => handleDelete(mov.id)}
              />
            </td>
          </tr>
        );
      })}
    </>
  );
}
