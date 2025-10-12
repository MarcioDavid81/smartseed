"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Beneficiation } from "@/types";
import { DetailBeneficiationModal } from "./DetailBeneficiationModal";

interface Props {
  descarte: Beneficiation;
  onUpdated: () => void;
}

const DetailBeneficiationButton = ({ descarte, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Beneficiation | null>(null);
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setSelected(descarte);
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
      <DetailBeneficiationModal
        descarte={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
};

export default DetailBeneficiationButton;
