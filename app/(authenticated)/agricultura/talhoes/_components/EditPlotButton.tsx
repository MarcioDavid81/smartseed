"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Talhao } from "@/types";
import UpsertPlotModal from "./UpsertPlotModal";

interface Props {
  talhao: Talhao;
}

const EditPlotButton = ({ talhao }: Props) => {
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
      <UpsertPlotModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        talhao={talhao}
      />
    </>
  );
};

export default EditPlotButton;
