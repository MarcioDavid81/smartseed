"use client";

import HoverButton from "@/components/HoverButton";
import { ArrowLeftRightIcon } from "lucide-react";
import { useState } from "react";
import { IndustryTransfer } from "@/types";
import UpsertTransferDepositModal from "./UpsertTransferDepositModal";

interface Props {
  transferencia?: IndustryTransfer;
}

const CreateTransferDepositButton = ({ transferencia }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <ArrowLeftRightIcon size={20} />
        Transferência
      </HoverButton>
      <UpsertTransferDepositModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        transferencia={transferencia}
      />
    </div>
  );
};

export default CreateTransferDepositButton;
