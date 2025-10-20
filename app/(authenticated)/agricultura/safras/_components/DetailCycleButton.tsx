"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Cycle } from "@/types/cycles";
import { DetailCycleModal } from "./DetailCycleModal";


interface Props {
  safra: Cycle;
  onUpdated: () => void;
}

const DetailCycleButton = ({ safra, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Cycle | null>(null);
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setSelected(safra);
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
      <DetailCycleModal
        safra={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
};

export default DetailCycleButton;
