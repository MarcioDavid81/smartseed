"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertIndustryDepositModal from "./UpsertDepositModal";
import { IndustryDeposit } from "@/types";

interface Props {
  deposit?: IndustryDeposit,
}

const CreateIndustryDepositButton = ({ deposit }: Props) => {
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
        industryDeposit={deposit}
      />
    </div>
  );
};

export default CreateIndustryDepositButton;
