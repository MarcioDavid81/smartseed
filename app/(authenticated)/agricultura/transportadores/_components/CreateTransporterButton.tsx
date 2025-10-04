"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertIndustryTransporterModal from "./UpsertTransporterModal";

interface Props {
  onUpdated?: () => void;
}

const CreateIndustryTransporterButton = ({ onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Transportador
      </HoverButton>
      <UpsertIndustryTransporterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateIndustryTransporterButton;
