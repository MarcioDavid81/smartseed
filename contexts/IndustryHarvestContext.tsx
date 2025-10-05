"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IndustryHarvest } from "@/types";
import { getToken } from "@/lib/auth-client";

type HarvestContextType = {
  harvests: IndustryHarvest[];
  isLoading: boolean;
  fetchHarvests: () => Promise<void>;
};

const IndustryHarvestContext = createContext<HarvestContextType | undefined>(undefined);

export function IndustryHarvestProvider({ children }: { children: ReactNode }) {
  const [harvests, setHarvests] = useState<IndustryHarvest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHarvests = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/industry/harvest", {
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
    <IndustryHarvestContext.Provider value={{ harvests, isLoading, fetchHarvests }}>
      {children}
    </IndustryHarvestContext.Provider>
  );
}

export function useIndustryHarvest() {
  const context = useContext(IndustryHarvestContext);
  if (!context) {
    throw new Error("useIndustryHarvest deve ser usado dentro de um IndustryHarvestProvider");
  }
  return context;
}
