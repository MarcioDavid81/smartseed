"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getToken } from "@/lib/auth-client";
import { Insumo } from "@/types/insumo";

type InsumoStockContextType = {
  insumos: Insumo[];
  isLoading: boolean;
  fetchInsumos: () => Promise<void>;
};

const InsumoStockContext = createContext<InsumoStockContextType | undefined>(
  undefined,
);

export function InsumoStockProvider({ children }: { children: ReactNode }) {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchInsumos = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await fetch("/api/insumos/estoque", {
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
