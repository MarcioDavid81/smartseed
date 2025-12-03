"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { IndustryTransfer } from "@/types";
import UpsertTransferDepositModal from "../../depositos/_components/UpsertTransferDepositModal";

interface Props {
  transferencia?: IndustryTransfer;
  onUpdated?: () => void;
}

const CreateTransferButton = ({ transferencia, onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
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

export default CreateTransferButton;
