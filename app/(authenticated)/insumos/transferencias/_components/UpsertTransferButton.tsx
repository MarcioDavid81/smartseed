"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Transfer } from "@/types/transfer";
import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import UpsertTransferModal from "./UpsertTransferModal";

interface Props {
  transferencia: Transfer;
}

const UpsertTransferButton = ({ transferencia }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(true)}
              className="transition hover:opacity-80"
            >
              <SquarePenIcon size={20} className="text-green" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <UpsertTransferModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        transferencia={transferencia}
      />
    </>
  );
};

export default UpsertTransferButton;
