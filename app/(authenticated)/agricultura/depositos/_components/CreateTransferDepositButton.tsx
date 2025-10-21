"use client";

import HoverButton from "@/components/HoverButton";
import { ArrowLeftIcon, ArrowLeftRightIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { IndustryTransfer } from "@/types";
import UpsertTransferDepositModal from "./UpsertTransferDepositModal";

interface Props {
  transferencia?: IndustryTransfer;
  onUpdated?: () => void;
}

const CreateTransferDepositButton = ({ transferencia, onUpdated }: Props) => {
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
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateTransferDepositButton;
