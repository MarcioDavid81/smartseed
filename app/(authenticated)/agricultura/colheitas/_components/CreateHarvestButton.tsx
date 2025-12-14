"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertHarvestModal from "./UpsertHarvestModal";
import { IndustryHarvest } from "@/types";

interface Props {
  colheita?: IndustryHarvest;
}

const CreateHarvestButton = ({ colheita }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Colheita
      </HoverButton>
      <UpsertHarvestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        colheita={colheita}
      />
    </div>
  );
};

export default CreateHarvestButton;
