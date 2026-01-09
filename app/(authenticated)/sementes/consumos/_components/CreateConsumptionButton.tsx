"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Consumption } from "@/types/consumption";
import UpsertConsumptionModal from "./UpsertConsumptionModal";

interface Props {
  plantio?: Consumption;
}

const CreateConsumptionButton = ({ plantio }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Plantio
      </HoverButton>
      <UpsertConsumptionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        plantio={plantio}
      />
    </div>
  );
};

export default CreateConsumptionButton;
