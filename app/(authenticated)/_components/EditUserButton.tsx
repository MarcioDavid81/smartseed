"use client";

import { useState } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { UpsertUserModal } from "./UpsertUserModal";
import { useUser } from "@/contexts/UserContext";
import HoverButton from "@/components/HoverButton";

export default function EditUserButton() {
  const [open, setOpen] = useState(false);
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
            setOpen(true); // abre o modal
          }}
          className="cursor-pointer"
        >
          Editar Perfil
        </DropdownMenuItem>
      </HoverButton>

      <UpsertUserModal open={open} onClose={() => setOpen(false)} user={user} />
    </>
  );
};
