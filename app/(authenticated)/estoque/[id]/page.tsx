import React from "react";
import Navbar from "../../_components/Navbar";
import Saudacao from "../../_components/Saudacao";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import HoverButton from "@/components/HoverButton";
import Link from "next/link";
import { ArrowUp, ArrowDown, SearchCodeIcon, Search, SquarePen } from "lucide-react";
import { tipoMovimentacaoInfo } from "@/app/_helpers/movimentacao";

interface StockDetailProps {
  params: {
    id: string;
  };
}

export default async function StockDetailPage({ params }: StockDetailProps) {

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

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return notFound();

  const endpoints = [
    "/api/harvest",
    "/api/buys",
    "/api/sales",
    "/api/consumption",
    "/api/beneficiation",
  ];

  const [cultivarRes, ...movementsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cultivars/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    ...endpoints.map((url) =>
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ),
  ]);

  if (!cultivarRes.ok) return notFound();
  const cultivar = await cultivarRes.json();

  // Agrupar e normalizar todas as movimentações
  const allMovements = (
    await Promise.all(movementsRes.map((res) => res.json()))
  )
    .flat()
    .filter((mov: any) => mov.cultivarId === params.id)
    .map((mov) => ({
      id: mov.id,
      date: mov.date,
      quantity: mov.quantityKg,
      type: mov.type || null,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleSearchCode = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      const filteredMovements = allMovements.filter((mov) =>
        mov.id.toLowerCase().includes(query.toLowerCase())
      );

    };

  return (
    <div className="flex flex-col w-full min-h-screen bg-found">
      <div className="min-h-screen w-full flex bg-background">
        <main className="flex-1 py-4 px-4 md:px-8 text-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-medium mb-4">Estoque</h1>
            <div className="flex items-center space-x-10">
              <Navbar />
              <Saudacao />
            </div>
          </div>
          <div className="flex flex-col items-start mb-4 bg-white p-4 rounded-lg shadow-md">
            <h1 className="text-2xl font-medium">{cultivar.name}</h1>
            <p>
              Produto: {cultivar.product} | Estoque Atual: {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cultivar.stock)} kg
            </p>

            <h2 className="text-xl font-medium mt-4">Movimentações</h2>
            {allMovements.length === 0 ? (
              <p className="text-muted-foreground">
                Nenhuma movimentação encontrada.
              </p>
            ) : (
              <ScrollArea className="h-[480px] w-full">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Quantidade
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Tipo de Movimentação
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Detalhes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMovements.map((mov) => (
                      <tr
                        key={mov.id}
                        className="bg-white border-b hover:bg-gray-50"
                      >
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
                        <td className="px-6 py-4">
                        <SquarePen className="text-green" size={18} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </div>
          <HoverButton>
            <Link href="/estoque">Voltar</Link>
          </HoverButton>
        </main>
      </div>
    </div>
  );
}
