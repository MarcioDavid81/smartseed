"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useStock } from "@/contexts/StockContext";
import { Consumption } from "@/types/consumption";
import UpsertConsumptionModal from "./UpsertConsumptionModal";

interface Props {
  plantio: Consumption;
  onUpdated: () => void;
}

const CreateConsumptionButton = ({ plantio, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchCultivars } = useStock();
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Plantio
      </HoverButton>
      <UpsertConsumptionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConsumptionCreated={fetchCultivars}
        plantio={plantio}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateConsumptionButton;
