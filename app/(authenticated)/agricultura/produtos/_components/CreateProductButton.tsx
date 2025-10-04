"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertIndustryProductModal from "./UpsertProductModal";

interface Props {
  onUpdated?: () => void;
}

const CreateIndustryProductButton = ({ onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Produto
      </HoverButton>
      <UpsertIndustryProductModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateIndustryProductButton;
