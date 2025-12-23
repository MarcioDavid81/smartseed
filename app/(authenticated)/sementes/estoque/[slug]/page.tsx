import React from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import HoverButton from "@/components/HoverButton";
import Link from "next/link";
import { getBaseUrl } from "@/app/_helpers/getBaseUrl";
import GenerateExtractReportModal from "./_components/GenerateExtractReportModal";
import NavItems from "../../../_components/NavItems";
import { ListStockDetailTable } from "./_components/ListStockDetailTable";
import { Metadata } from "next";
import { extractIdFromSlug } from "@/app/_helpers/slug";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const id = extractIdFromSlug(params.slug);
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const baseUrl = getBaseUrl();

  const res = await fetch(`${baseUrl}/api/cultivars/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return {
      title: "Estoque",
    };
  }

  const cultivar = await res.json();

  return {
    title: `Estoque de ${cultivar.name}`,
    keywords: [
      "produção de sementes",
      "gestão de sementeiras",
      "controle de produção e estoque de sementes",
    ],
    description: "O seu sistema de gestão de produção de sementes",
    authors: [
      { name: "Marcio David", url: "https://md-webdeveloper.vercel.app" },
    ],
  };
}


interface StockDetailProps {
  params: { slug: string };
}


export default async function StockDetailPage({ params }: StockDetailProps) {
  const id = extractIdFromSlug(params.slug);
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return notFound();

  const endpoints = [
    "/api/harvest",
    "/api/buys",
    "/api/sales",
    "/api/consumption",
    "/api/beneficiation",
    "/api/seed-adjust",
    "/api/transformation",
  ];

  const baseUrl = getBaseUrl();
  const [cultivarRes, ...movementsRes] = await Promise.all([
    fetch(`${baseUrl}/api/cultivars/${id}`, {
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
    .filter((mov: any) => mov.cultivarId === id)
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
        <main className="flex-1 py-4 px-4 md:px-8 text-gray-800 overflow-x-auto min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-medium mb-4"> Extrato de Estoque</h1>
            <NavItems />
          </div>
          <div>            
            <ListStockDetailTable allMovements={allMovements} cultivar={cultivar} />
          </div>
          <div className="flex items-center justify-between mt-6">
            <GenerateExtractReportModal movements={allMovements} cultivarName={cultivar.name} />
            <Link href="/sementes/estoque">
              <HoverButton className="mt-4">Voltar</HoverButton>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
