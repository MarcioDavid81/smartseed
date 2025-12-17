"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Maintenance } from "@/types";
import UpsertMaintenanceModal from "./UpsertMaintenanceModal";

interface Props {
  manutencao: Maintenance;
}

const EditMaintenanceButton = ({ manutencao }: Props) => {
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
      <UpsertMaintenanceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        manutencao={manutencao}
      />
    </>
  );
};

export default EditMaintenanceButton;
