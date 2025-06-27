"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import LogoutButton from "./LogoutButton";
import { Button } from "@/components/ui/button";
import EditUserButton from "./EditUserButton";

export const UserMenu = () => {
  const { user } = useUser();

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
          <div className="px-2 py-1 text-sm font-light">
            <span>{user?.name}</span>
          </div>
          <DropdownMenuSeparator className="my-2" />

          <EditUserButton />

          <DropdownMenuSeparator className="my-2" />

          <LogoutButton />

          <DropdownMenuSeparator className="my-2" />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
