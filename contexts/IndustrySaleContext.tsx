"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IndustrySale } from "@/types";
import { getToken } from "@/lib/auth-client";

type SaleContextType = {
  sales: IndustrySale[];
  isLoading: boolean;
  fetchSales: () => Promise<void>;
};

const IndustrySaleContext = createContext<SaleContextType | undefined>(undefined);

export function IndustrySaleProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<IndustrySale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/industry/sale", {
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
    <IndustrySaleContext.Provider value={{ sales, isLoading, fetchSales }}>
      {children}
    </IndustrySaleContext.Provider>
  );
}

export function useIndustrySale() {
  const context = useContext(IndustrySaleContext);
  if (!context) {
    throw new Error("useIndustrySale deve ser usado dentro de um IndustrySaleProvider");
  }
  return context;
}
