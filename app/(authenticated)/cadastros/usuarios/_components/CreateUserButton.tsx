"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import UpsertUserModal from "./UpsertUserModal";
import { AppUser } from "@/types";

interface Props {
  user?: AppUser;
}

const CreateUserButton = ({ user }: Props) => {
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
        user={user}
      />
    </div>
  );
};

export default CreateUserButton;
