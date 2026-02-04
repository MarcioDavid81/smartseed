"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PurchaseOrder, PurchaseOrderDetails } from "@/types";
import UpsertPurchaseOrderModal from "./UpsertPurchaseOrderModal";

interface Props {
  compra: PurchaseOrderDetails;
}

const EditPurchaseOrderButton = ({ compra }: Props) => {
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
      <UpsertPurchaseOrderModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        compra={compra}
      />
    </>
  );
};

export default EditPurchaseOrderButton;
