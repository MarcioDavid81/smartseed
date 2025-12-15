"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import { UpsertFuelTankModal } from "./UpsertFuelTankModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FuelTank, Machine } from "@/types";


interface Props {
  fuelTank: FuelTank;
}

const EditFuelTankButton = ({ fuelTank }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(true)}
              className="hover:opacity-80 transition"
            >
              <SquarePenIcon size={20} className="text-green" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <UpsertFuelTankModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        fuelTank={fuelTank}
      />
    </>
  );
};

export default EditFuelTankButton;
