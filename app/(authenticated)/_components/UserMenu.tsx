"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import LogoutButton from "./LogoutButton";
import { UpsertUserModal } from "./UpsertUserModal";
import { Button } from "@/components/ui/button";
import HoverButton from "@/components/HoverButton";

export const UserMenu = () => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
          <Avatar className="cursor-pointer">
            <AvatarImage src={user?.imageUrl} alt={user?.name} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-48" align="end">
          <div className="px-2 py-1 text-xs text-muted-foreground">
            {user?.name}
          </div>

          <HoverButton className="w-full">

          <DropdownMenuItem onClick={() => setOpen(true)}>
            Editar Perfil
          </DropdownMenuItem>
          </HoverButton>


          <DropdownMenuSeparator className="my-2" />

          <LogoutButton />
        </DropdownMenuContent>
      </DropdownMenu>

      <UpsertUserModal open={open} onClose={() => setOpen(false)} user={user} />
    </>
  );
};
