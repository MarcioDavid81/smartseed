// _components/purchase-order-overview.tsx
import { CommercialStatusBadge } from "@/app/(authenticated)/_components/CommercialStatusBadge";
import { PURCHASE_TYPE_LABELS } from "@/app/(authenticated)/_constants/commercial";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseOrderDetails } from "@/types";
import { PurchaseOrderItems } from "./PurchaseOrderItems";

type Props = {
  purchaseOrder: PurchaseOrderDetails;
};

export function PurchaseOrderOverview({ purchaseOrder }: Props) {
  const items = purchaseOrder.items ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Pedido {purchaseOrder.document}
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
      </CardContent>
    </Card>
  );
}
