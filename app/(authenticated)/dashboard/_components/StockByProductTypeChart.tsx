"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { PRODUCT_TYPE_OPTIONS } from "../../_constants/products";
import { getToken } from "@/lib/auth-client";
import { useCycle } from "@/contexts/CycleContext";

export default function StockByProductTypeChart() {
  const { selectedCycle } = useCycle();
  const [selectedType, setSelectedType] = useState(
    selectedCycle?.productType ?? PRODUCT_TYPE_OPTIONS[0].value,
  );
  const [data, setData] = useState<{ name: string; stock: number }[]>([]);

  // Sincroniza o tipo selecionado com o ciclo atual quando ele mudar
  useEffect(() => {
    if (selectedCycle?.productType) {
      setSelectedType(selectedCycle.productType);
    }
  }, [selectedCycle]);

  useEffect(() => {
    const token = getToken();
    async function fetchData() {
      const res = await fetch(`/api/dashboard/stock-by-product-type?type=${selectedType}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      const filterdData = json.filter((item : any) => item.stock > 0);
      setData(filterdData);
    }

    fetchData();
  }, [selectedType]);

  return (
    <div className="space-y-4 p-4 border rounded-xl shadow bg-white">
      <h3>Estoque por Tipo de Produto</h3>

      <Select value={selectedType} onValueChange={(value) => setSelectedType(value as typeof selectedType)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecione o tipo de produto" />
        </SelectTrigger>
        <SelectContent>
          {PRODUCT_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} className="font-light text-xs">
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="stock" fill="url(#premiumGradient)" name="Estoque" radius={[10, 10, 0, 0]} />
          {/* Gradiente Premium */}
            <defs>
              <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#79D82F" />
                <stop offset="100%" stopColor="#4C8A1F" />
              </linearGradient>
            </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
