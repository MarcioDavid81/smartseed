"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertPlotModal from "./UpsertPlotModal";
import { Talhao } from "@/types";

interface Props {
  talhao?: Talhao;
}

const CreatePlotButton = ({ talhao }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
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
      />
    </div>
  );
};

export default CreatePlotButton;
