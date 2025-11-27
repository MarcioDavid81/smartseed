"use client";

import { createContext, useContext } from "react";
import type { AppUser } from "@/types/user";

type UserContextType = {
  user: AppUser;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser deve ser usado dentro de um <UserProvider>");
  }

  return context;
};


export const UserProvider = ({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) => {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};

