import { useCycle } from "@/contexts/CycleContext";
import { useMemo } from "react";

export function useCyclePlots() {
  const { selectedCycle } = useCycle();

  return useMemo(() => {
    if (!selectedCycle?.talhoes?.length) return [];

    return selectedCycle.talhoes.map((ct) => ({
      id: ct.talhaoId,
      name: ct.talhao.name,
      area: ct.talhao.area,
      farmId: ct.talhao.farmId,
      farm: ct.talhao.farm,
    }));
  }, [selectedCycle]);
}