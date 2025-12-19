"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import SeedStockAdjustmentModal from "./SeedStockAdjustmentModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GrDocumentConfig } from "react-icons/gr";
import { Button } from "@/components/ui/button";


const SeedStockAdjustmentButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => setIsOpen(true)} variant="ghost">
              <GrDocumentConfig size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ajustar Estoque</p>
          </TooltipContent>  
        </Tooltip>
      </TooltipProvider>
      <SeedStockAdjustmentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default SeedStockAdjustmentButton;
