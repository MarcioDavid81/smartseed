"use client";

import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GrDocumentConfig } from "react-icons/gr";
import { Button } from "@/components/ui/button";
import IndustryStockAdjustmentModal from "./IndustryStockAdjustmentModal";


const IndustryStockAdjustmentButton = () => {
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
      <IndustryStockAdjustmentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default IndustryStockAdjustmentButton;
