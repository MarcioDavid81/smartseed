"use client";

import { createContext, useContext } from "react";
import type { AppUser } from "@/types/user";

type UserContextType = {
  user: AppUser | null;
};

const UserContext = createContext<UserContextType>({
  user: null,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({
  user,
  children,
}: {
  user: AppUser | null;
  children: React.ReactNode;
}) => {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};
