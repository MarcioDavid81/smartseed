"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IndustryHarvest, IndustryStock } from "@/types";
import { getToken } from "@/lib/auth-client";

type StockContextType = {
  stocks: IndustryStock[];
  isLoading: boolean;
  fetchStocks: () => Promise<void>;
};

const IndustryStockContext = createContext<StockContextType | undefined>(undefined);

export function IndustryStockProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<IndustryStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/industry/stock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setStocks(data);
    } catch (error) {
      console.error("Erro ao buscar stocks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  return (
    <IndustryStockContext.Provider value={{ stocks, isLoading, fetchStocks }}>
      {children}
    </IndustryStockContext.Provider>
  );
}

export function useIndustryStock() {
  const context = useContext(IndustryStockContext);
  if (!context) {
    throw new Error("useIndustryStock deve ser usado dentro de um IndustryStockProvider");
  }
  return context;
}
