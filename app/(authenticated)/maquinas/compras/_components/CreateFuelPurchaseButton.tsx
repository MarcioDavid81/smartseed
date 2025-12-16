"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { FuelPurchase } from "@/types";
import UpsertFuelPurchaseModal from "./UpsertFuelPurchaseModal";

interface Props {
  compra?: FuelPurchase;
}

const CreateFuelPurchaseButton = ({ compra }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Compra
      </HoverButton>
      <UpsertFuelPurchaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        compra={compra}
      />
    </div>
  );
};

export default CreateFuelPurchaseButton;
