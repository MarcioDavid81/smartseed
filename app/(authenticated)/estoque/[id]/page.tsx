import React from "react";
import Navbar from "../../_components/Navbar";
import Saudacao from "../../_components/Saudacao";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import HoverButton from "@/components/HoverButton";
import Link from "next/link";
import EstoqueDetalhado from "./_components/EstoqueDetalhado";
import { getBaseUrl } from "@/app/_helpers/getBaseUrl";
import GenerateExtractReportModal from "./_components/GenerateExtractReportModal";
import NavItems from "../../_components/NavItems";

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

  const baseUrl = getBaseUrl();
  const [cultivarRes, ...movementsRes] = await Promise.all([
    fetch(`${baseUrl}/api/cultivars/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    ...endpoints.map((url) =>
      fetch(`${baseUrl}${url}`, {
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
            <NavItems />
          </div>
          <EstoqueDetalhado
            cultivar={cultivar}
            initialMovements={allMovements}
          />
          <div className="flex items-center justify-between mt-6">
            <GenerateExtractReportModal movements={allMovements} cultivarName={cultivar.name} />
            <Link href="/estoque">
              <HoverButton className="mt-4">Voltar</HoverButton>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
