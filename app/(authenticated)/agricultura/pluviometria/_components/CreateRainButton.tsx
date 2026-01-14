"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Rain } from "@/types";
import UpsertRainModal from "./UpsertRainModal";

interface Props {
  chuva?: Rain,
}

const CreateRainButton = ({ chuva }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Chuva
      </HoverButton>
      <UpsertRainModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        rain={chuva}
      />
    </div>
  );
};

export default CreateRainButton;
