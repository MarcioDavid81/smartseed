"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Maintenance } from "@/types";
import UpsertMaintenanceModal from "./UpsertMaintenanceModal";

interface Props {
  manutencao?: Maintenance;
}

const CreateMaintenanceButton = ({ manutencao }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Manutenção
      </HoverButton>
      <UpsertMaintenanceModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        manutencao={manutencao}
      />
    </div>
  );
};

export default CreateMaintenanceButton;
