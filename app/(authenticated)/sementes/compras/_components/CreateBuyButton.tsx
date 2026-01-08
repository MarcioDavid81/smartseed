"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Buy } from "@/types";
import UpsertBuyModal from "./UpsertBuyModal";

interface Props {
  compra?: Buy;
}

const CreateBuyButton = ({ compra }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Compra
      </HoverButton>
      <UpsertBuyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        compra={compra}
      />
    </div>
  );
};

export default CreateBuyButton;
