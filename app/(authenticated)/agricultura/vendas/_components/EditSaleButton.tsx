"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import { useStock } from "@/contexts/StockContext";
import UpsertSaleModal from "./UpsertSaleModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IndustrySale } from "@/types";

interface Props {
  venda: IndustrySale;
  onUpdated: () => void;
}

const EditSaleButton = ({ venda, onUpdated }: Props) => {
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
      <UpsertSaleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSaleCreated={fetchCultivars}
        venda={venda}
        onUpdated={onUpdated}
      />
    </>
  );
};

export default EditSaleButton;
