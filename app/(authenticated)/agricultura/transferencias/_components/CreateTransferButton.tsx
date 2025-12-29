"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { IndustryTransfer } from "@/types";
import UpsertTransferDepositModal from "../../depositos/_components/UpsertTransferDepositModal";

interface Props {
  transferencia?: IndustryTransfer;
}

const CreateTransferButton = ({ transferencia }: Props) => {
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
      />
    </div>
  );
};

export default CreateTransferButton;
