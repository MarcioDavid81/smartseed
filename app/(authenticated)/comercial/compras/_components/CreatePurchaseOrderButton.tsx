"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { PurchaseOrder } from "@/types";
import UpsertPurchaseOrderModal from "./UpsertPurchaseOrderModal";

interface Props {
  compra?: PurchaseOrder;
}

const CreatePurchaseOrderButton = ({ compra }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Compra
      </HoverButton>
      <UpsertPurchaseOrderModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        compra={compra}
      />
    </div>
  );
};

export default CreatePurchaseOrderButton;
