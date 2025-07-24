"use client";

import HoverButton from "@/components/HoverButton";
import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import NewCycleModal from "./NewCycleModal";

const CreateCycleButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        Safra
        <ChevronRightIcon size={20} />
      </HoverButton>
      <NewCycleModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default CreateCycleButton;
