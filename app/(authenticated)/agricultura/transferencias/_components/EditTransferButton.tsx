"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IndustryTransfer } from "@/types";
import UpsertTransferDepositModal from "../../depositos/_components/UpsertTransferDepositModal";

interface Props {
  transferencia: IndustryTransfer;
}

const EditTransferButton = ({ transferencia }: Props) => {
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
      <UpsertTransferDepositModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        transferencia={transferencia}
      />
    </>
  );
};

export default EditTransferButton;
