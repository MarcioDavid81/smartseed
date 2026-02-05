"use client";

import UpsertPurchaseModal from "@/app/(authenticated)/insumos/compras/_components/UpsertPurchaseModal";
import UpsertBuyModal from "@/app/(authenticated)/sementes/compras/_components/UpsertBuyModal";
import { PurchaseOrderItemDetail } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PurchaseOrderItemDetail & { unityPrice?: number };
  customerId: string;
  customerName: string;
};

export function AttendPurchaseOrderItemModal({
  open,
  onOpenChange,
  item,
  customerId,
  customerName,
}: Props) {
  const onClose = () => onOpenChange(false);

  /**
   * Contexto comum de atendimento (remessa)
   */
  const attendContext = {
    purchaseOrderItemId: item.id,
    maxQuantity:
      item.remainingQuantity && item.remainingQuantity > 0
        ? Number(item.remainingQuantity)
        : undefined,
  };

  /**
   * Insumos
   */
  if (item.product) {
    return (
      <UpsertPurchaseModal
        isOpen={open}
        onClose={onClose}
        purchaseOrderItemId={attendContext.purchaseOrderItemId}
        maxQuantityKg={attendContext.maxQuantity}
        initialQuantity={attendContext.maxQuantity}
        productId={item.product.id}
        customerId={customerId}
        customerName={customerName}
        unitPrice={item.unityPrice}
      />
    );
  }

  /**
   * Sementes
   */
  if (item.cultivar) {
    return (
      <UpsertBuyModal
        isOpen={open}
        onClose={onClose}
        purchaseOrderItemId={attendContext.purchaseOrderItemId}
        maxQuantityKg={attendContext.maxQuantity}
        initialQuantityKg={attendContext.maxQuantity}
        cultivarId={item.cultivar.id}
        customerId={customerId}
        customerName={customerName}
        unityPrice={item.unityPrice}
      />
    );
  }

  return null;
}
