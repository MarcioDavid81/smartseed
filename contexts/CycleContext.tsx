// app/contexts/cycle-context.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Cycle } from "@/types/cycles";

type CycleContextType = {
  selectedCycle: Cycle | null;
  setSelectedCycle: (cycle: Cycle) => void;
};

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export const CycleProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedCycle, setSelectedCycleState] = useState<Cycle | null>(null);

  // Pega do localStorage na primeira montagem
  useEffect(() => {
    const storedCycle = localStorage.getItem("selectedCycle");
    if (storedCycle) {
      setSelectedCycleState(JSON.parse(storedCycle));
    }
  }, []);

  const setSelectedCycle = (cycle: Cycle) => {
    localStorage.setItem("selectedCycle", JSON.stringify(cycle));
    setSelectedCycleState(cycle);
  };

  return (
    <CycleContext.Provider value={{ selectedCycle, setSelectedCycle }}>
      {children}
    </CycleContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useCycle = () => {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error("useCycle must be used within a CycleProvider");
  }
  return context;
};
