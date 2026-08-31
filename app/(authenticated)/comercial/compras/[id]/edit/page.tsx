import NavItems from "@/app/(authenticated)/_components/NavItems";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import PurchaseOrderForm from "../../new/_components/PurchaseOrderForm";

export const metadata: Metadata = {
  title: "Comercial - Editar Compra",
  keywords: [
    "produção de sementes",
    "gestão de sementeiras",
    "controle de produção e estoque de sementes",
  ],
  description: "O seu sistema de gestão de produção de sementes",
  authors: [{ name: "Marcio David", url: "https://www.marciodavid.dev.br" }],
};

interface Props {
  params: {
    id: string;
  };
}

export default async function EditPurchaseOrderPage({ params }: Props) {
  const purchaseOrder = await db.purchaseOrder.findUnique({
    where: { id: params.id },
    include: {
      items: true,
    },
  });

  if (!purchaseOrder) {
    return <div>Pedido de compra não encontrado</div>;
  }

  const serializedPurchaseOrder = {
    ...purchaseOrder,
    items: purchaseOrder.items.map((item) => ({
      ...item,
      quantity: item.quantity.toNumber(),
      unityPrice: item.unityPrice.toNumber(),
      totalPrice: item.totalPrice.toNumber(),
      fulfilledQuantity: item.fulfilledQuantity.toNumber(),
    })),
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-found">
      <div className="min-h-screen w-full flex bg-background">
        <main className="flex-1 px-4 md:px-8 text-gray-800 min-w-0">
          <div className="sticky top-0 z-40 -mx-4 md:-mx-8 px-4 md:px-8 py-4 bg-background flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-2xl font-medium mb-4 md:mb-0">
              Comercial - Editar Pedido de Compra
            </h1>
            <NavItems />
          </div>

          <div className="pb-4">
            <PurchaseOrderForm compra={serializedPurchaseOrder} />
          </div>
        </main>
      </div>
    </div>
  );
}