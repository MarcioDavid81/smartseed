"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Purchase } from "@/types/purchase";
import UpsertPurchaseModal from "./UpsertPurchaseModal";

interface Props {
  compra?: Purchase;
  onUpdated?: () => void;
}

const CreatePurchaseButton = ({ compra, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Compra
      </HoverButton>
      <UpsertPurchaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        compra={compra}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreatePurchaseButton;
