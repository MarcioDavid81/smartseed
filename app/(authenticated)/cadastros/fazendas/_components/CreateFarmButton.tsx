"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Farm } from "@/types";
import UpsertFarmModal from "./UpsertFarmModal";

interface Props {
  farm?: Farm;
}

const CreateFarmButton = ({ farm }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Fazenda
      </HoverButton>
      <UpsertFarmModal  
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        farm={farm}
      />
    </div>
  );
};

export default CreateFarmButton;
