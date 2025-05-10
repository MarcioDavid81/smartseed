"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Harvest } from "@/types";
import { getToken } from "@/lib/auth-client";

type HarvestContextType = {
  harvests: Harvest[];
  isLoading: boolean;
  fetchHarvests: () => Promise<void>;
};

const HarvestContext = createContext<HarvestContextType | undefined>(undefined);

export function HarvestProvider({ children }: { children: ReactNode }) {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHarvests = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/harvest", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setHarvests(data);
    } catch (error) {
      console.error("Erro ao buscar colheitas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvests();
  }, []);

  return (
    <HarvestContext.Provider value={{ harvests, isLoading, fetchHarvests }}>
      {children}
    </HarvestContext.Provider>
  );
}

export function useHarvest() {
  const context = useContext(HarvestContext);
  if (!context) {
    throw new Error("useHarvest deve ser usado dentro de um HarvestProvider");
  }
  return context;
}
