"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import { UpsertMachineModal } from "./UpsertMachineModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Machine } from "@/types";

interface Props {
  machine: Machine;
}

const EditMachineButton = ({ machine }: Props) => {
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
      <UpsertMachineModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        machine={machine}
      />
    </>
  );
};

export default EditMachineButton;
