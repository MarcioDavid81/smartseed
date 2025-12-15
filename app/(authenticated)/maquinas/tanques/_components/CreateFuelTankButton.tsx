"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { FuelTank } from "@/types";
import { UpsertFuelTankModal } from "./UpsertFuelTankModal";

interface Props {
  fuelTank?: FuelTank;
}

const CreateFuelTankButton = ({ fuelTank }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Tanque de Combustível
      </HoverButton>
      <UpsertFuelTankModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        fuelTank={fuelTank}
      />
    </div>
  );
};

export default CreateFuelTankButton;
