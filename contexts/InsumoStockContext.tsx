"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getToken } from "@/lib/auth-client";
import { InputStock } from "@/types";

type InsumoStockContextType = {
  stocks: InputStock[];
  isLoading: boolean;
  fetchStocks: () => Promise<void>;
};

const InsumoStockContext = createContext<InsumoStockContextType | undefined>(
  undefined,
);

export function InsumoStockProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<InputStock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await fetch("/api/insumos/stock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStocks(data);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  return (
    <InsumoStockContext.Provider value={{ stocks, isLoading, fetchStocks }}> 
      {children}
    </InsumoStockContext.Provider>
  );
}

export function useInsumoStock() {
  const context = useContext(InsumoStockContext);
  if (!context) {
    throw new Error(
      "useInsumoStock deve ser usado dentro de um InsumoStockProvider",
    );
  }
  return context;
}
