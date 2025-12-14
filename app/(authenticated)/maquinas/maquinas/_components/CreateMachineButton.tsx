"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { UpsertMachineModal } from "./UpsertMachineModal";
import { Machine } from "@/types";

interface Props {
  machine?: Machine;
}

const CreateMachineButton = ({ machine }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Máquina
      </HoverButton>
      <UpsertMachineModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        machine={machine}/>
    </div>
  );
};

export default CreateMachineButton;
