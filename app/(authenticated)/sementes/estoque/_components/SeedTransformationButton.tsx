"use client";

import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import SeedTransformationModal from "./SeedTransformationModal";
import { Rotate3D } from "lucide-react";


const SeedTransformationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setIsOpen(true)} variant="ghost">
              <Rotate3D size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Transformar Sementes</p>
          </TooltipContent>  
        </Tooltip>
      </TooltipProvider>
      <SeedTransformationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default SeedTransformationButton;
