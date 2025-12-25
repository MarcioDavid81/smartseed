"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertIndustryTransporterModal from "./UpsertTransporterModal";
import { IndustryTransporter } from "@/types";

interface Props {
  industryTransporter?: IndustryTransporter;
}

const CreateIndustryTransporterButton = ({ industryTransporter }: Props) => {
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
        industryTransporter={industryTransporter}
      />
    </div>
  );
};

export default CreateIndustryTransporterButton;
