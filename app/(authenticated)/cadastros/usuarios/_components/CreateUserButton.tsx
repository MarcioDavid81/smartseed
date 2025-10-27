"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertUserModal from "./UpsertUserModal";

interface Props {
  onUpdated?: () => void;
}

const CreateUserButton = ({ onUpdated }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Usuário
      </HoverButton>
      <UpsertUserModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default CreateUserButton;
