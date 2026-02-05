"use client";

import UpsertPurchaseModal from "@/app/(authenticated)/insumos/compras/_components/UpsertPurchaseModal";
import UpsertBuyModal from "@/app/(authenticated)/sementes/compras/_components/UpsertBuyModal";
import { PurchaseOrderItemDetail } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PurchaseOrderItemDetail;
};

export function AttendPurchaseOrderItemModal({
  open,
  onOpenChange,
  item,
}: Props) {
  const onClose = () => onOpenChange(false);

  if (item.product) {
    return <UpsertPurchaseModal isOpen={open} onClose={onClose} />;
  }

  if (item.cultivar) {
    return <UpsertBuyModal isOpen={open} onClose={onClose} />;
  }

  return null;
}
