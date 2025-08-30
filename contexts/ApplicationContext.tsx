"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken } from "@/lib/auth-client";
import { Application } from "@/types/application";

type ApplicationContextType = {
  aplicacoes: Application[];
  isLoading: boolean;
  fetchApplications: () => Promise<void>;
};

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [aplicacoes, setAplicacoes] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch("/api/insumos/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setAplicacoes(data);
    } catch (error) {
      console.error("Erro ao buscar aplicações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <ApplicationContext.Provider value={{ aplicacoes, isLoading, fetchApplications }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error("useApplication deve ser usado dentro de um ApplicationProvider");
  }
  return context;
}