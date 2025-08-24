"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getToken } from "@/lib/auth-client";
import { ProductStock } from "@/types/productStock"

type InsumoStockContextType = {
  insumos: ProductStock[];
  isLoading: boolean;
  fetchInsumos: () => Promise<void>;
};

const InsumoStockContext = createContext<InsumoStockContextType | undefined>(
  undefined,
);

export function InsumoStockProvider({ children }: { children: ReactNode }) {
  const [insumos, setInsumos] = useState<ProductStock[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchInsumos = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await fetch("/api/insumos/stock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setInsumos(data);
    } catch (error) {
      console.error("Error fetching insumos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  return (
    <InsumoStockContext.Provider value={{ insumos, isLoading, fetchInsumos }}>
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
