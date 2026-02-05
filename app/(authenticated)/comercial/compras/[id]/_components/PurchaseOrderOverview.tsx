"use client";

import { CommercialStatusBadge } from "@/app/(authenticated)/_components/CommercialStatusBadge";
import { PURCHASE_TYPE_LABELS } from "@/app/(authenticated)/_constants/commercial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseOrderDetails } from "@/types";
import { PurchaseOrderItems } from "./PurchaseOrderItems";
import { CornerDownLeft, RefreshCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Props = {
  purchaseOrder: PurchaseOrderDetails;
};

export function PurchaseOrderOverview({ purchaseOrder }: Props) {
    const router = useRouter();

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const handleReturn = () => {
    router.push("/comercial/compras");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            Pedido {purchaseOrder.document}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleRefreshPage} className="text-sm text-primary">
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Atualizar página</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CommercialStatusBadge status={purchaseOrder.status} />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 text-sm">
        <div className="w-full flex items-center justify-between">
          <div className="flex flex-col gap-6 w-[50%]">
            <div>
              <span className="text-muted-foreground">Fornecedor</span>
              <p className="font-medium">{purchaseOrder.customer.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Data</span>
              <p>{new Date(purchaseOrder.date).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-6 w-[50%]">
            <div>
              <span className="text-muted-foreground">Tipo</span>
              <p>{PURCHASE_TYPE_LABELS[purchaseOrder.type]}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Observações</span>
              <p>{purchaseOrder.notes || "—"}</p>
            </div>
          </div>
        </div>
        <div>
          <PurchaseOrderItems purchaseOrder={purchaseOrder} />
        </div>
        <Button type="button" className="max-w-[100px] bg-green text-white mt-4 font-light" onClick={handleReturn}>
          <CornerDownLeft size={20} />
            Voltar
        </Button>
      </CardContent>
    </Card>
  );
}
