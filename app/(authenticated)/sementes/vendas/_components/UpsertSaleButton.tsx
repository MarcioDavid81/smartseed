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
import UpsertSaleModal from "./UpsertSaleModal";
import { Sale } from "@/types/sale";

interface Props {
  venda: Sale;
  onUpdated: () => void;
}

const UpsertSaleButton = ({ venda, onUpdated }: Props) => {
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
        onHarvestCreated={fetchCultivars}
        venda={venda}
        onUpdated={onUpdated}
      />
    </>
  );
};

export default UpsertSaleButton;
