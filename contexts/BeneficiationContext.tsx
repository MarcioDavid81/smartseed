"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken } from "@/lib/auth-client";
import { Beneficiation } from "@/types";

type BeneficiationContextType = {
  descartes: Beneficiation[];
  isLoading: boolean;
  fetchBeneficiations: () => Promise<void>;
};

const BeneficiationContext = createContext<BeneficiationContextType | undefined>(undefined);

export function BeneficiationProvider({ children }: { children: ReactNode }) {
  const [descartes, setDescartes] = useState<Beneficiation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBeneficiations = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/beneficiation", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setDescartes(data);
    } catch (error) {
      console.error("Erro ao buscar descartes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiations();
  }, []);

  return (
    <BeneficiationContext.Provider value={{ descartes, isLoading, fetchBeneficiations }}>
      {children}
    </BeneficiationContext.Provider>
  );
}

export function useBeneficiation() {
  const context = useContext(BeneficiationContext);
  if (!context) {
    throw new Error("useBeneficiation deve ser usado dentro de um SaleProvider");
  }
  return context;
}
