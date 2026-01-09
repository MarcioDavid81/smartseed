"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertSaleModal from "./UpsertSaleModal";
import { Sale } from "@/types/sale";

interface Props {
  venda?: Sale;
}

const CreateSaleButton = ({ venda }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Venda
      </HoverButton>
      <UpsertSaleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        venda={venda}
      />
    </div>
  );
};

export default CreateSaleButton;
