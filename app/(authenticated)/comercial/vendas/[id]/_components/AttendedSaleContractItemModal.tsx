"use client";

import UpsertIndustrySaleModal from "@/app/(authenticated)/agricultura/vendas/_components/UpsertSaleModal";
import UpsertSaleModal from "@/app/(authenticated)/sementes/vendas/_components/UpsertSaleModal";
import { SaleContractItemDetail } from "@/types/saleContractItemDetail";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SaleContractItemDetail & { unityPrice?: number };
  customerId: string;
  customerName: string;
};

export function AttendSaleContractItemModal({
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
    saleContractItemId: item.id,
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
      <UpsertIndustrySaleModal
        isOpen={open}
        onClose={onClose}
        saleContractItemId={attendContext.saleContractItemId}
        maxQuantityKg={attendContext.maxQuantity}
        initialQuantity={attendContext.maxQuantity}
        product={item.product}
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
      <UpsertSaleModal
        isOpen={open}
        onClose={onClose}
        saleContractItemId={attendContext.saleContractItemId}
        maxQuantityKg={attendContext.maxQuantity}
        initialQuantityKg={attendContext.maxQuantity}
        cultivarId={item.cultivar.id}
        customerId={customerId}
        customerName={customerName}
        saleValue={item.unityPrice}
      />
    );
  }

  return null;
}
