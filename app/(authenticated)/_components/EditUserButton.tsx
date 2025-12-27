"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/UserContext";
import HoverButton from "@/components/HoverButton";
import UpsertUserModal from "../cadastros/usuarios/_components/UpsertUserModal";

export default function EditUserButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  return (
    <>
      <HoverButton
        title="Editar Perfil"
        aria-label="Editar Perfil"
        className="p-2 w-full rounded-md transition-colors"
      >
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault(); // evita fechar o menu
            setIsOpen(true); // abre o modal
          }}
          className="cursor-pointer"
        >
          Editar Perfil
        </DropdownMenuItem>
      </HoverButton>

      <UpsertUserModal isOpen={isOpen} onClose={() => setIsOpen(false)} user={user} />
    </>
  );
};
