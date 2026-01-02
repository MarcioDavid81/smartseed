"use client";

import { useCycle } from "@/contexts/CycleContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCycles } from "@/queries/registrations/use-cycles-query";

const SelectCycle = () => {
  const { selectedCycle, setSelectedCycle } = useCycle();
  
  const {
    data: safras = [],
    isLoading,
  } = useCycles();

  return (
    <div>
      <p className="text-green text-sm">Safra</p>

      <Select
        value={selectedCycle?.id}
        onValueChange={(id) => {
          const found = safras.find((c) => c.id === id);
          if (found) setSelectedCycle(found);
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[200px] text-sm font-light">
          <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione uma safra"} />
        </SelectTrigger>
        <SelectContent>
          {safras.map((cycle) => (
            <SelectItem key={cycle.id} value={cycle.id} className="font-light">
              <span className="text-sm font-light">{cycle.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectCycle;

