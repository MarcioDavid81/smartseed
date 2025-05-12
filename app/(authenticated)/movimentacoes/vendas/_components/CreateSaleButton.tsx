"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useStock } from "@/contexts/StockContext";
import UpsertSaleModal from "./UpsertSaleModal";
import { Sale } from "@/types/sale";

interface Props {
  venda?: Sale;
  onUpdated?: () => void;
}

const CreateSaleButton = ({ venda, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchCultivars } = useStock();
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Venda
      </HoverButton>
      <UpsertSaleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onHarvestCreated={fetchCultivars}
        venda={venda}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateSaleButton;
