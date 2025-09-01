"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken } from "@/lib/auth-client";
import { Transfer } from "@/types/transfer";

type TransferContextType = {
  transferencias: Transfer[];
  isLoading: boolean;
  fetchTransferencias: () => Promise<void>;
};

const TransferContext = createContext<TransferContextType | undefined>(undefined);

export function TransferProvider({ children }: { children: ReactNode }) {
  const [transferencias, setTransferencias] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransferencias = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/insumos/transfers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTransferencias(data);
    } catch (error) {
      console.error("Erro ao buscar transferências:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransferencias();
  }, []);

  return (
    <TransferContext.Provider value={{ transferencias, isLoading, fetchTransferencias }}>
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfer() {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error("useTransfer deve ser usado dentro de um TransferProvider");
  }
  return context;
}