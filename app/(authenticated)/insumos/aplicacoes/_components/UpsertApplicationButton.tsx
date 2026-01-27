"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Application } from "@/types/application";
import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import UpsertApplicationModal from "./UpsertApplicationModal";

interface Props {
  aplicacao: Application;
}

const UpsertApplicationButton = ({ aplicacao }: Props) => {
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
      <UpsertApplicationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        aplicacao={aplicacao}
      />
    </>
  );
};

export default UpsertApplicationButton;
