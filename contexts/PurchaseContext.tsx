"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Purchase } from "@/types/purchase";
import { getToken } from "@/lib/auth-client";

type PurchaseContextType = {
  purchases: Purchase[];
  isLoading: boolean;
  fetchPurchases: () => Promise<void>;
};

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

export function PurchaseProvider({ children }: { children: ReactNode }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/insumos/purchases", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setPurchases(data);
    } catch (error) {
      console.error("Erro ao buscar compras:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <PurchaseContext.Provider value={{ purchases, isLoading, fetchPurchases }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase() {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error("usePurchase deve ser usado dentro de um PurchaseProvider");
  }
  return context;
}
