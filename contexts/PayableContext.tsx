"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AccountPayable } from "@/types";
import { getToken } from "@/lib/auth-client";

type PayableContextType = {
  payables: AccountPayable[];
  isLoading: boolean;
  fetchPayables: () => Promise<void>;
};

const PayableContext = createContext<PayableContextType | undefined>(undefined);

export function PayableProvider({ children }: { children: ReactNode }) {
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayables = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/financial/payables", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setPayables(data);
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayables();
  }, []);

  return (
    <PayableContext.Provider value={{ payables, isLoading, fetchPayables }}>
      {children}
    </PayableContext.Provider>
  );
}

export function usePayable() {
  const context = useContext(PayableContext);
  if (!context) {
    throw new Error("usePayable deve ser usado dentro de um PayableProvider");
  }
  return context;
}
