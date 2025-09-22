"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useStock } from "@/contexts/StockContext";
import UpsertBeneficiationModal from "./UpsertBeneficiationModal";
import { Beneficiation } from "@/types";

interface Props {
  descarte?: Beneficiation;
  onUpdated?: () => void;
}

const CreateBeneficiationButton = ({ descarte, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchCultivars } = useStock();
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Descarte
      </HoverButton>
      <UpsertBeneficiationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onBeneficiotionCreated={fetchCultivars}
        descarte={descarte}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateBeneficiationButton;
