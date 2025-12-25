"use client";

import { SquarePenIcon } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IndustryTransporter } from "@/types";
import UpsertIndustryTransporterModal from "./UpsertTransporterModal";

interface Props {
  industryTransporter: IndustryTransporter;
}

const EditIndustryTransporterButton = ({ industryTransporter }: Props) => {
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
      <UpsertIndustryTransporterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        industryTransporter={industryTransporter}
      />
    </>
  );
};

export default EditIndustryTransporterButton;
