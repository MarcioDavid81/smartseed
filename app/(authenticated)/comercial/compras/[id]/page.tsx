import NavItems from "@/app/(authenticated)/_components/NavItems";
import { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { PurchaseOrderDetails } from "@/types";
import { PurchaseOrderItems } from "./_components/PurchaseOrderItems";
import { PurchaseOrderOverview } from "./_components/PurchaseOrderOverview";

export const metadata: Metadata = {
  title: "Comercial - Compras",
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

type PageProps = {
  params: {
    id: string;
  };
};

async function getPurchaseOrderById(id: string): Promise<PurchaseOrderDetails> {
  const token = cookies().get("token")?.value;
  if (!token) throw new Error("UNAUTHORIZED");

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  if (!host) throw new Error("HOST_NOT_FOUND");

  const res = await fetch(
    `${proto}://${host}/api/commercial/purchase-orders/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("FAILED_TO_FETCH_PURCHASE_ORDER");

  return (await res.json()) as PurchaseOrderDetails;
}

export default async function PurchaseDetailsPage({ params: { id } }: PageProps) {
  const purchaseOrder = await getPurchaseOrderById(id);

  return (
    <div className="flex flex-col w-full min-h-screen bg-found">
      <div className="min-h-screen w-full flex bg-background">
        <main className="flex-1 py-4 px-4 md:px-8 text-gray-800 overflow-x-auto min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-medium mb-4">
              Comercial - Compras - Detalhes
            </h1>
            <NavItems />
          </div>

          <div className="grid gap-6">
            <PurchaseOrderOverview purchaseOrder={purchaseOrder} />
          </div>
        </main>
      </div>
    </div>
  );
}
