"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useStock } from "@/contexts/StockContext";
import UpsertPlotModal from "./UpsertPlotModal";
import { Talhao } from "@/types";

interface Props {
  talhao?: Talhao;
  onUpdated?: () => void;
}

const CreatePlotButton = ({ talhao, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchCultivars } = useStock();
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Talhão
      </HoverButton>
      <UpsertPlotModal  
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        talhao={talhao}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreatePlotButton;
