"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useStock } from "@/contexts/StockContext";
import { Harvest } from "@/types";
import UpsertInsumosModal from "./UpsertInsumosModal";

interface Props {
  colheita?: Harvest;
  onUpdated?: () => void;
}

const CreateInsumosButton = ({ colheita, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchCultivars } = useStock();
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Insumo
      </HoverButton>
      <UpsertInsumosModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onHarvestCreated={() => {
          fetchCultivars();
          setIsOpen(false);
        }}
        colheita={colheita}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateInsumosButton;
