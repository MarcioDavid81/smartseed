"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import { useStock } from "@/contexts/StockContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UpsertConsumptionModal from "./UpsertConsumptionModal";
import { Consumption } from "@/types/consumption";

interface Props {
  plantio: Consumption
  onUpdated: () => void;
}

const UpsertConsumptionButton = ({ plantio, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchCultivars } = useStock();
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
      <UpsertConsumptionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConsumptionCreated={fetchCultivars}
        plantio={plantio}
        onUpdated={onUpdated}
      />
    </>
  );
};

export default UpsertConsumptionButton;
