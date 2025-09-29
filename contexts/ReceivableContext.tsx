"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AccountReceivable } from "@/types";
import { getToken } from "@/lib/auth-client";

type ReceivableContextType = {
  receivables: AccountReceivable[];
  isLoading: boolean;
  fetchReceivables: () => Promise<void>;
};

const ReceivableContext = createContext<ReceivableContextType | undefined>(undefined);

export function ReceivableProvider({ children }: { children: ReactNode }) {
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReceivables = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/financial/receivables", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setReceivables(data);
    } catch (error) {
      console.error("Erro ao buscar recebíveis:", error); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivables();
  }, []);

  return (
    <ReceivableContext.Provider value={{ receivables, isLoading, fetchReceivables }}>
      {children}
    </ReceivableContext.Provider>
  );
}

export function useReceivable() {
  const context = useContext(ReceivableContext);
  if (!context) {
    throw new Error("useReceivable deve ser usado dentro de um ReceivableProvider");
  }
  return context;
}
