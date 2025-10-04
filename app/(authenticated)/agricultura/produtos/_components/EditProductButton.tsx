"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Insumo } from "@/types/insumo";
import { IndustryProduct } from "@/types";
import UpsertIndustryProductModal from "./UpsertProductModal";

interface Props {
  industryProduct: IndustryProduct;
  onUpdated: () => void;
}

const EditIndustryProductButton = ({ industryProduct, onUpdated }: Props) => {
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
      <UpsertIndustryProductModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        industryProduct={industryProduct}
        onUpdated={onUpdated}
      />
    </>
  );
};

export default EditIndustryProductButton;
