"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import UpsertInsumosModal from "./UpsertInsumosModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Insumo } from "@/types/insumo";

interface Props {
  product: Insumo;
  onUpdated: () => void;
}

const EditInsumosButton = ({ product, onUpdated }: Props) => {
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
      <UpsertInsumosModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        product={product}
        onUpdated={onUpdated}
      />
    </>
  );
};

export default EditInsumosButton;
