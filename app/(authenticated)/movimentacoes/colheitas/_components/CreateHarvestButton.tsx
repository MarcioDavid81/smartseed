"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useStock } from "@/contexts/StockContext";
import UpsertHarvestModal from "./UpsertHarvestModal";
import { Harvest } from "@/types";

interface Props {
  colheita: Harvest;
  onUpdated: () => void;
}

const CreateHarvestButton = ({ colheita, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchCultivars } = useStock();
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Colheita
      </HoverButton>
      <UpsertHarvestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onHarvestCreated={fetchCultivars}
        colheita={colheita}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateHarvestButton;
