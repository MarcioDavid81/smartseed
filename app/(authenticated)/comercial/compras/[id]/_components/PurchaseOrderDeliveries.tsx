"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PurchaseOrderItemDetail } from "@/types/purchaseOrderItemDetail";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PurchaseOrderItemDetail;
};

export function PurchaseOrderItemDeliveries({
  open,
  onOpenChange,
  item,
}: Props) {
  const deliveries = item.deliveries ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Remessas — {item.product?.name ?? item.cultivar?.name}
          </DialogTitle>
        </DialogHeader>

        {deliveries.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            Nenhuma remessa registrada para este item.
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex justify-between rounded-md border p-3"
              >
                <span>{delivery.quantity}</span>
                <span>{delivery.date}</span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
