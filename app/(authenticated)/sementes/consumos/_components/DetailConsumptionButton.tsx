"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DetailConsumptionModal } from "./DetailConsumptionModal";
import { Consumption } from "@/types/consumption";

interface Props {
  plantio: Consumption;
  onUpdated: () => void;
}

const DetailConsumptionButton = ({ plantio, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Consumption | null>(null);
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setSelected(plantio);
                setIsOpen(true);
              }}
              className="hover:opacity-80 transition"
            >
              <Search className="text-blue" size={20} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Detalhes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DetailConsumptionModal
        plantio={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
};

export default DetailConsumptionButton;
