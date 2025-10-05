"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertIndustryDepositModal from "./UpsertDepositModal";

interface Props {
  onUpdated?: () => void;
}

const CreateIndustryDepositButton = ({ onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Depósito
      </HoverButton>
      <UpsertIndustryDepositModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateIndustryDepositButton;
