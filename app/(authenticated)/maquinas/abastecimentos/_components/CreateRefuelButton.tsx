"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Refuel } from "@/types";
import UpsertRefuelModal from "./UpsertRefuelModal";

interface Props {
  abastecimento?: Refuel;
}

const CreateRefuelButton = ({ abastecimento }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Abastecimento
      </HoverButton>
      <UpsertRefuelModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        abastecimento={abastecimento}
      />
    </div>
  );
};

export default CreateRefuelButton;
