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
import { Buy } from "@/types";
import UpsertBuyModal from "./UpsertBuyModal";

interface Props {
  compra: Buy;
  onUpdated: () => void;
}

const UpsertBuyButton = ({ compra, onUpdated }: Props) => {
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
      <UpsertBuyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onHarvestCreated={fetchCultivars}
        compra={compra}
        onUpdated={onUpdated}
      />
    </>
  );
};

export default UpsertBuyButton;
