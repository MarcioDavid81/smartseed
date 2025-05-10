"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useStock } from "@/contexts/StockContext";
import { Buy } from "@/types";
import UpsertBuyModal from "./UpsertBuyModal";

interface Props {
  compra: Buy;
  onUpdated: () => void;
}

const CreateBuyButton = ({ compra, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchCultivars } = useStock();
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Compra
      </HoverButton>
      <UpsertBuyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onHarvestCreated={fetchCultivars}
        compra={compra}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateBuyButton;
