"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Insumo } from "@/types/insumo"
import UpsertInsumosModal from "./UpsertInsumosModal";

interface Props {
  product: Insumo;
  onUpdated?: () => void;
}

const CreateInsumosButton = ({ product, onUpdated }: Props) => {
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
        onUpdated={onUpdated}
        product={product}
      />
    </div>
  );
};

export default CreateInsumosButton;
