"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Refuel } from "@/types";
import UpsertRefuelModal from "./UpsertRefuelModal";

interface Props {
  abastecimento: Refuel;
}

const EditRefuelButton = ({ abastecimento }: Props) => {
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
      <UpsertRefuelModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        abastecimento={abastecimento}
      />
    </>
  );
};

export default EditRefuelButton;
