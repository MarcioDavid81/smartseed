"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Purchase } from "@/types/purchase";
import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import UpsertPurchaseModal from "./UpsertPurchaseModal";

interface Props {
  compra: Purchase;
  onUpdated: () => void;
}

const UpsertPurchaseButton = ({ compra, onUpdated }: Props) => {
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
      <UpsertPurchaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        compra={compra}
        onUpdated={onUpdated}
      />
    </>
  );
};

export default UpsertPurchaseButton;
