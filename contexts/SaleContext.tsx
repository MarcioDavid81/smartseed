"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken } from "@/lib/auth-client";
import { Sale } from "@/types/sale";

type SaleContextType = {
  sales: Sale[];
  isLoading: boolean;
  fetchSales: () => Promise<void>;
};

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export function SaleProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/sales", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setSales(data);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <SaleContext.Provider value={{ sales, isLoading, fetchSales }}>
      {children}
    </SaleContext.Provider>
  );
}

export function useSale() {
  const context = useContext(SaleContext);
  if (!context) {
    throw new Error("useSale deve ser usado dentro de um SaleProvider");
  }
  return context;
}
