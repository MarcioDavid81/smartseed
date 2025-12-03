"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IndustryTransfer } from "@/types";
import { getToken } from "@/lib/auth-client";

type TransferContextType = {
  transfers: IndustryTransfer[];
  isLoading: boolean;
  fetchTransfers: () => Promise<void>;
};

const IndustryTransferContext = createContext<TransferContextType | undefined>(undefined);

export function IndustryTransferProvider({ children }: { children: ReactNode }) {
  const [transfers, setTransfers] = useState<IndustryTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/industry/transfer", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTransfers(data);
    } catch (error) {
      console.error("Erro ao buscar transferências:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  return (
    <IndustryTransferContext.Provider value={{ transfers, isLoading, fetchTransfers }}>
      {children}
    </IndustryTransferContext.Provider>
  );
}

export function useIndustryTransfer() {
  const context = useContext(IndustryTransferContext);
  if (!context) {
    throw new Error("useIndustryTransfer deve ser usado dentro de um IndustryTransferProvider");
  }
  return context;
}
