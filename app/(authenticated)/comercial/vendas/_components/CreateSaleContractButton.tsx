"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { SaleContract } from "@/types";
import UpsertSaleContractModal from "./UpsertSaleContractModal";

interface Props {
  venda?: SaleContract;
}

const CreateSaleContractButton = ({ venda }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Venda
      </HoverButton>
      <UpsertSaleContractModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        venda={venda}
      />
    </div>
  );
};

export default CreateSaleContractButton;
