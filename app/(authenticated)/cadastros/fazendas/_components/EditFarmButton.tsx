"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Farm } from "@/types";
import UpsertFarmModal from "./UpsertFarmModal";

interface Props {
  farm: Farm;
}

const EditFarmButton = ({ farm }: Props) => {
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
      <UpsertFarmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        farm={farm}
      />
    </>
  );
};

export default EditFarmButton;
