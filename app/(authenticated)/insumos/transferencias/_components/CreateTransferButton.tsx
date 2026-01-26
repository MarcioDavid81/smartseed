"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Transfer } from "@/types/transfer";
import UpsertTransferModal from "./UpsertTransferModal";

interface Props {
  transferencia?: Transfer;
}

const CreateTransferButton = ({ transferencia }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Transferência
      </HoverButton>
      <UpsertTransferModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        transferencia={transferencia}
      />
    </div>
  );
};

export default CreateTransferButton;
