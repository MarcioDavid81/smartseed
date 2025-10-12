"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DetailPurchaseModal } from "./DetailPurchaseModal";
import { Purchase } from "@/types/purchase";



interface Props {
  compra: Purchase;
  onUpdated: () => void;
}

const DetailPurchaseButton = ({ compra, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Purchase | null>(null);
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setSelected(compra);
                setIsOpen(true);
              }}
              className="hover:opacity-80 transition"
            >
              <Search className="text-blue" size={20} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Detalhes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DetailPurchaseModal compra={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default DetailPurchaseButton;
