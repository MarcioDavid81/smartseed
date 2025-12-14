"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
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
}

const EditSaleButton = ({ venda }: Props) => {
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
      <UpsertSaleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        venda={venda}
      />
    </>
  );
};

export default EditSaleButton;
