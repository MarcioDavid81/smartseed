"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertBeneficiationModal from "./UpsertBeneficiationModal";
import { Beneficiation } from "@/types";

interface Props {
  descarte?: Beneficiation;
}

const CreateBeneficiationButton = ({ descarte }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Descarte
      </HoverButton>
      <UpsertBeneficiationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        descarte={descarte}
      />
    </div>
  );
};

export default CreateBeneficiationButton;
