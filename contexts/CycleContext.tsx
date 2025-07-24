"use client";

import { Cycle } from "@/types/cycles";
import { createContext, useContext } from "react";

type CycleContextType = {
  cycles: Cycle | null;
};

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export const useCycleContext = () => {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error("useCycleContext must be used within a CycleProvider");
  }
  return context;
};
export const CycleProvider = ({
  cycles,
  children,
}: {
  cycles: Cycle | null;
  children: React.ReactNode;
}) => {
  return (
    <CycleContext.Provider value={{ cycles }}>
      {children}
    </CycleContext.Provider>
  );
};