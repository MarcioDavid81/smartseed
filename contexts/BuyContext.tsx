"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Buy } from "@/types";
import { getToken } from "@/lib/auth-client";

type BuyContextType = {
  buys: Buy[];
  isLoading: boolean;
  fetchBuys: () => Promise<void>;
};

const BuyContext = createContext<BuyContextType | undefined>(undefined);

export function BuyProvider({ children }: { children: ReactNode }) {
  const [buys, setBuys] = useState<Buy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBuys = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/buys", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setBuys(data);
    } catch (error) {
      console.error("Erro ao buscar compras:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuys();
  }, []);

  return (
    <BuyContext.Provider value={{ buys, isLoading, fetchBuys }}>
      {children}
    </BuyContext.Provider>
  );
}

export function useBuy() {
  const context = useContext(BuyContext);
  if (!context) {
    throw new Error("useBuys deve ser usado dentro de um BuyProvider");
  }
  return context;
}
