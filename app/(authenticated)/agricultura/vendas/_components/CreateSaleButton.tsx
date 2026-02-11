"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertIndustrySaleModal from "./UpsertSaleModal";
import { IndustrySale } from "@/types";

interface Props {
  venda?: IndustrySale;
}

const CreateSaleButton = ({ venda }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Venda
      </HoverButton>
      <UpsertIndustrySaleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        venda={venda}
      />
    </div>
  );
};

export default CreateSaleButton;
