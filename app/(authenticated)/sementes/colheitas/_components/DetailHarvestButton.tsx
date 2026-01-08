"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Harvest } from "@/types";
import { DetailHarvestModal } from "./DetailHarvestModal";

interface Props {
  colheita: Harvest;
}

const DetailHarvestButton = ({ colheita }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Harvest | null>(null);
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setSelected(colheita);
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
      <DetailHarvestModal colheita={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default DetailHarvestButton;
