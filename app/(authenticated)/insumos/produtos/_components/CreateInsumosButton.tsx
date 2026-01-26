"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertInsumosModal from "./UpsertInsumosModal";
import { Insumo } from "@/types";

interface Props {
  product?: Insumo;
}

const CreateInsumosButton = ({ product }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Insumo
      </HoverButton>
      <UpsertInsumosModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        product={product}
      />
    </div>
  );
};

export default CreateInsumosButton;
