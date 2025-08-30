"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useInsumoStock } from "@/contexts/InsumoStockContext";
import { Application } from "@/types/application";
import UpsertApplicationModal from "./UpsertApplicationModal";

interface Props {
  aplicacao?: Application;
  onUpdated?: () => void;
}

const CreateApplicationButton = ({ aplicacao, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchInsumos } = useInsumoStock();
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Aplicação
      </HoverButton>
      <UpsertApplicationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApplicationCreated={fetchInsumos}
        aplicacao={aplicacao}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateApplicationButton;