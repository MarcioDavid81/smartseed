"use client";

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getToken } from "@/lib/auth-client";
import { toast } from "sonner";
import { formatNumber } from "@/app/_helpers/currency";

interface Talhao {
  id: string;
  name: string;
  area: number;
  farm?: {
    id: string;
    name: string;
  };
}

interface FarmGroup {
  farmName: string;
  children: Talhao[];
}

interface MultiPlotSelectorProps {
  control: any;
  name: string;
}

export function MultiPlotSelector({ control, name }: MultiPlotSelectorProps) {
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [grouped, setGrouped] = useState<FarmGroup[]>([]);
  const [filtered, setFiltered] = useState<FarmGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🚜 Busca os talhões da API
  useEffect(() => {
    setLoading(true);
    async function fetchTalhoes() {
      const token = getToken();
      if (!token) {
        toast.error("Usuário não autenticado.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/plots", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data: Talhao[] = await res.json();
        setTalhoes(data);
        const groupedData = groupByFarm(data);
        setGrouped(groupedData);
        setFiltered(groupedData);
      } catch (err) {
        toast.error("Erro ao carregar os talhões.");
      } finally {
        setLoading(false);
      }
    }

    fetchTalhoes();
  }, []);

  // 🔎 Filtra os talhões com base na busca
  useEffect(() => {
    if (!search) {
      setFiltered(grouped);
      return;
    }

    const lower = search.toLowerCase();
    const result = grouped
      .map((farm) => {
        const matchingChildren = farm.children.filter(
          (t) =>
            t.name.toLowerCase().includes(lower) ||
            farm.farmName.toLowerCase().includes(lower)
        );
        return { ...farm, children: matchingChildren };
      })
      .filter((farm) => farm.children.length > 0);

    setFiltered(result);
  }, [search, grouped]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = field.value || [];

        const toggleSelection = (id: string) => {
          if (selected.includes(id)) {
            field.onChange(selected.filter((item) => item !== id));
          } else {
            field.onChange([...selected, id]);
          }
        };

        // 📊 Calcula a soma total das áreas dos talhões selecionados
        const calculateTotalArea = () => {
          return selected.reduce((total, id) => {
            const talhao = talhoes.find((t) => t.id === id);
            return total + (talhao?.area || 0);
          }, 0);
        };

        const totalArea = calculateTotalArea();

        return (
          <div className="w-full">
            <div className="flex flex-col gap-3">
              <Label>Selecione os talhões</Label>
              <Input
                placeholder="Buscar talhão ou fazenda..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="h-64 overflow-y-auto border rounded-md p-2">
                <div className="space-y-3">
                  {loading && (
                    <p className="text-sm text-muted-foreground">
                      Carregando talhões...
                    </p>
                  )}
                  {!loading && filtered.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum talhão encontrado
                    </p>
                  )}
                  {!loading && filtered.map((farm) => (
                    <div key={farm.farmName} className="space-y-1">
                      <p className="font-medium text-sm">{farm.farmName.toUpperCase()}</p>
                      {farm.children.map((t) => (
                        <div
                          key={t.id}
                          className={cn(
                            "flex items-center gap-2 rounded-md p-1 hover:bg-muted cursor-pointer"
                          )}
                        >
                          <Checkbox
                            checked={selected.includes(t.id)}
                            onCheckedChange={() => toggleSelection(t.id)}
                          />
                          <span className="text-sm">{t.name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</span>
                          <span className="text-xs font-light text-muted-foreground">
                            {formatNumber(t.area)} ha
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {selected.length > 0 && (
                <div>
                  {/* 📊 Exibição da soma total das áreas */}
                  <div className="bg-muted/50 rounded-md p-3 border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Total de talhões selecionados: {selected.length}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        Área total: {formatNumber(totalArea)} ha
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }}
    />
  );
}

// 🪄 Função utilitária: agrupa os talhões por fazenda
function groupByFarm(talhoes: Talhao[]): FarmGroup[] {
  const farmsMap: Record<string, FarmGroup> = {};

  for (const t of talhoes) {
    const farmName = t.farm?.name || "Sem fazenda";
    if (!farmsMap[farmName]) {
      farmsMap[farmName] = { farmName, children: [] };
    }
    farmsMap[farmName].children.push(t);
  }

  return Object.values(farmsMap);
}
