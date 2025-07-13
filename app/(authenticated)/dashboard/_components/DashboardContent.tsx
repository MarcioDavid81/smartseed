"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import CreateFarmButton from "./CreateFarmButton";
import CreatePlotButton from "./CreatePlotButton";
import CreateCustomerButton from "./CreateCustomerButton";
import StockByProductTypeChart from "./StockByProductTypeChart";
import { getToken } from "@/lib/auth-client";
import { Cultivar } from "@/types";
import UseByCultivarChart from "./UseByCultivarChart";
import { CultivarStatusBadge } from "../../estoque/_components/CultivarStatusBadge";


const DashboardContent = () => {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [selectedCultivar, setSelectedCultivar] = useState<Cultivar | null>(
    null
  );
  const [totalCultivar, setTotalCultivar] = useState(0);
  const [totalDescarte, setTotalDescarte] = useState(0);
  const [totalSemente, setTotalSemente] = useState(0);
  const [porcentagemAproveitamento, setPorcentagemAproveitamento] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchCultivars = async () => {
      const token = await getToken();

      const res = await fetch("/api/cultivars/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const filteredData = data.filter(
        (product: Cultivar) => product.stock > 0
      );
      setCultivars(filteredData);
      setSelectedCultivar(filteredData[0]);
    };

    fetchCultivars();
  }, []);

  useEffect(() => {
    if (!selectedCultivar) return;

    async function fetchDashboardData() {
      const token = await getToken();
      const res = await fetch(
        `/api/dashboard/summary?cultivar=${selectedCultivar?.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();

      setTotalCultivar(json.totalCultivar);
      setTotalDescarte(json.totalDescarte);
      setPorcentagemAproveitamento(
        ((json.colheitaKg - json.totalDescarte) / json.colheitaKg) * 100 || 0
      );
      setTotalSemente(json.colheitaKg - json.totalDescarte);
      setChartData(json.chartData);
    }

    fetchDashboardData();
  }, [selectedCultivar]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Coluna principal */}
      <div className="md:col-span-3 flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <Select
            value={selectedCultivar?.id}
            onValueChange={(id) => {
              const found = cultivars.find((c) => c.id === id);
              if (found) setSelectedCultivar(found);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Cultivar" />
            </SelectTrigger>
            <SelectContent>
              {cultivars.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cards em linha */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-normal">Total Colhido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-medium">
                {totalCultivar.toLocaleString("pt-BR")} kg
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-normal">Total Descartado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-medium">
                {totalDescarte.toLocaleString("pt-BR")} kg
              </p>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader>
              <CardTitle className="font-normal">Aproveitamento</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end gap-2">
              <p className="text-2xl font-medium">
                {porcentagemAproveitamento.toFixed(2)}%
              </p>
              <p className="text-sm font-light">
                {(totalCultivar - totalDescarte).toLocaleString("pt-BR")} kg de
                semente
              </p>
              {selectedCultivar && (
                <div className="absolute right-6 top-6">
                  <CultivarStatusBadge status={selectedCultivar.status} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico principal */}
        <StockByProductTypeChart />
      </div>

      {/* Coluna lateral */}
      <div className="md:col-span-1 flex flex-col h-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-normal">Cadastros</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-8">
            <div className="flex gap-4">
              <CreateFarmButton />
              <CreatePlotButton />
            </div>
            <CreateCustomerButton />
          </CardContent>
        </Card>

        <UseByCultivarChart
          aproveitado={totalSemente}
          descartado={totalDescarte}
        />
      </div>
    </div>
  );
};

export default DashboardContent;
