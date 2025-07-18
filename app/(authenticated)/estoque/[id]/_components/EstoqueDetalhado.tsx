"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import EstoqueTableBody from "./EstoqueTableBody";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Movement {
  id: string;
  date: string;
  quantity: number;
  type: string;
}

interface Cultivar {
  name: string;
  product: string;
  stock: number;
}

export default function StockDetailContent({
  cultivar,
  initialMovements,
}: {
  cultivar: Cultivar;
  initialMovements: Movement[];
}) {
  const [movements, setMovements] = useState(initialMovements);
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

  return (
    <div className="flex flex-col items-start mb-4 bg-white p-4 rounded-lg shadow-md">
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
        <ScrollArea className="h-[450px] w-full">
          <table className="w-full font-light text-sm text-left text-gray-500">
            <thead className="sticky top-0 text-sm text-gray-700 bg-gray-50">
              <tr>
                <th className="font-medium px-6 py-3">Data</th>
                <th className="font-medium px-6 py-3">Quantidade</th>
                <th className="font-medium px-6 py-3">Tipo de Movimentação</th>
                <th className="font-medium px-6 py-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              <EstoqueTableBody movements={movements} />
            </tbody>
          </table>
        </ScrollArea>
      )}
    </div>
  );
}
