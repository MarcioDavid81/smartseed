"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { UpsertMachineModal } from "./UpsertMachineModal";

interface Props {
  onUpdated?: () => void;
}

const CreateMachineButton = ({ onUpdated }: Props) => {
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
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateMachineButton;
