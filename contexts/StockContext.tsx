"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Cultivar } from "@/types";
import { getToken } from "@/lib/auth-client";

type StockContextType = {
  cultivars: Cultivar[];
  isLoading: boolean;
  fetchCultivars: () => Promise<void>;
};

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: ReactNode }) {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCultivars = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/cultivars/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const filtered = data.filter((c: Cultivar) => c.stock > 0);
      setCultivars(filtered);
    } catch (error) {
      console.error("Erro ao buscar cultivares:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCultivars();
  }, []);

  return (
    <StockContext.Provider value={{ cultivars, isLoading, fetchCultivars }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStock deve ser usado dentro de um StockProvider");
  }
  return context;
}
