"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IndustryDeposit } from "@/types";
import UpsertIndustryDepositModal from "./UpsertDepositModal";

interface Props {
  industryDeposit: IndustryDeposit;
  onUpdated: () => void;
}

const EditIndustryDepositButton = ({ industryDeposit, onUpdated }: Props) => {
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
      <UpsertIndustryDepositModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        industryDeposit={industryDeposit}
        onUpdated={onUpdated}
      />
    </>
  );
};

export default EditIndustryDepositButton;
