"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import { useStock } from "@/contexts/StockContext";
import UpsertHarvestModal from "./UpsertHarvestModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Harvest } from "@/types";

interface Props {
  colheita: Harvest;
  onUpdated: () => void;
}

const UpsertHarvestButton = ({ colheita, onUpdated }: Props) => {
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
      <UpsertHarvestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onHarvestCreated={fetchCultivars}
        colheita={colheita}
        onUpdated={onUpdated}
      />
    </>
  );
};

export default UpsertHarvestButton;
