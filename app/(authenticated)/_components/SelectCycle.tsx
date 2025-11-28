"use client";

import { useEffect, useState } from "react";
import { Cycle } from "@/types/cycles";
import { useCycle } from "@/contexts/CycleContext";
import { getToken } from "@/lib/auth-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SelectCycle = () => {
  const { selectedCycle, setSelectedCycle } = useCycle();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const res = await fetch("/api/cycles", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setCycles(data);
      } catch (error) {
        console.error("Erro ao carregar ciclos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, []);

  return (
    <div>
      <p className="text-green text-sm">Safra</p>

      <Select
        value={selectedCycle?.id}
        onValueChange={(id) => {
          const found = cycles.find((c) => c.id === id);
          if (found) setSelectedCycle(found);
        }}
        disabled={loading}
      >
        <SelectTrigger className="w-[200px] text-sm font-light">
          <SelectValue placeholder={loading ? "Carregando..." : "Selecione uma safra"} />
        </SelectTrigger>
        <SelectContent>
          {cycles.map((cycle) => (
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

