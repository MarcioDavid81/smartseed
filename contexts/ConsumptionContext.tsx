"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken } from "@/lib/auth-client";
import { Consumption } from "@/types/consumption";

type ConsumptionContextType = {
  plantios: Consumption[];
  isLoading: boolean;
  fetchConsumptions: () => Promise<void>;
};

const ConsumptionContext = createContext<ConsumptionContextType | undefined>(undefined);

export function ConsumptionProvider({ children }: { children: ReactNode }) {
  const [plantios, setPlantios] = useState<Consumption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConsumptions = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/consumption", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setPlantios(data);
    } catch (error) {
      console.error("Erro ao buscar plantios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumptions();
  }, []);

  return (
    <ConsumptionContext.Provider value={{ plantios, isLoading, fetchConsumptions }}>
      {children}
    </ConsumptionContext.Provider>
  );
}

export function useConsumption() {
  const context = useContext(ConsumptionContext);
  if (!context) {
    throw new Error("useConsumption deve ser usado dentro de um SaleProvider");
  }
  return context;
}
