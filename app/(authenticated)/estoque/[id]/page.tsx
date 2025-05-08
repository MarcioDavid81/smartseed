import React from "react";
import Navbar from "../../_components/Navbar";
import Saudacao from "../../_components/Saudacao";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import HoverButton from "@/components/HoverButton";
import Link from "next/link";
import EstoqueTableBody from "./_components/EstoqueTableBody";
import EstoqueDetalhado from "./_components/EstoqueDetalhado";

interface StockDetailProps {
  params: {
    id: string;
  };
}

export default async function StockDetailPage({ params }: StockDetailProps) {
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
          <EstoqueDetalhado
            cultivar={cultivar}
            initialMovements={allMovements}
          />
          {/* <div className="flex flex-col items-start mb-4 bg-white p-4 rounded-lg shadow-md">
            <h1 className="text-2xl font-medium">{cultivar.product}</h1>
            <p>
              Cultivar: {cultivar.name} | Estoque Atual:{" "}
              {new Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(cultivar.stock)}{" "}
              kg
            </p>

            <h2 className="text-xl font-medium mt-4">Movimentações</h2>
            {allMovements.length === 0 ? (
              <p className="text-muted-foreground">
                Nenhuma movimentação encontrada.
              </p>
            ) : (
              <ScrollArea className="h-[480px] w-full">
                <table className="w-full font-light text-sm text-left text-gray-500">
                  <thead className="sticky top-0 text-sm text-gray-700 bg-gray-50">
                    <tr>
                      <th scope="col" className="font-medium px-6 py-3">
                        Data
                      </th>
                      <th scope="col" className="font-medium px-6 py-3">
                        Quantidade
                      </th>
                      <th scope="col" className="font-medium px-6 py-3">
                        Tipo de Movimentação
                      </th>
                      <th scope="col" className="font-medium px-6 py-3">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                  <EstoqueTableBody movements={allMovements} />
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </div> */}
          <Link href="/estoque">
            <HoverButton className="mt-4">Voltar</HoverButton>
          </Link>
        </main>
      </div>
    </div>
  );
}
