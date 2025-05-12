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

export default function StockByProductTypeChart() {
  const [selectedType, setSelectedType] = useState(PRODUCT_TYPE_OPTIONS[0].value);
  const [data, setData] = useState<{ name: string; stock: number }[]>([]);

  useEffect(() => {
    const token = getToken();
    async function fetchData() {
      const res = await fetch(`/api/dashboard/stock-by-product-type?type=${selectedType}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      setData(json);
    }

    fetchData();
  }, [selectedType]);

  return (
    <div className="space-y-4 p-4 border rounded-xl shadow bg-white">
      <h2 className="text-lg font-normal">Estoque por Tipo de Produto</h2>

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
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="stock" fill="#63B926" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
