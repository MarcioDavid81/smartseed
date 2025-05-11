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
import UpsertBeneficiationModal from "./UpsertBeneficiationModal";
import { Beneficiation } from "@/types";

interface Props {
  descarte: Beneficiation;
  onUpdated: () => void;
}

const UpsertBeneficiationButton = ({ descarte, onUpdated }: Props) => {
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
      <UpsertBeneficiationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onBeneficiotionCreated={fetchCultivars}
        descarte={descarte}
        onUpdated={onUpdated}
      />
    </>
  );
};

export default UpsertBeneficiationButton;
