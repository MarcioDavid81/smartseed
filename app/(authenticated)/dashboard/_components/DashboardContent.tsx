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

const DashboardContent = () => {
  const [cultivars, setCultivars] = useState<string[]>([]);
  const [selectedCultivar, setSelectedCultivar] = useState<string>("");
  const [totalCultivar, setTotalCultivar] = useState(0);
  const [totalDescarte, setTotalDescarte] = useState(0);
  const [porcentagemAproveitamento, setPorcentagemAproveitamento] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
  const fetchCultivars = async () => {

    const token = await getToken(); // token JWT

    const res = await fetch("/api/cultivars/get", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setCultivars(data);
    setSelectedCultivar(data[0]);
  };

  fetchCultivars();
}, []);

  useEffect(() => {
    if (!selectedCultivar) return;

    async function fetchDashboardData() {
      const res = await fetch(
        `/api/dashboard/summary?cultivar=${selectedCultivar}`
      );
      const json = await res.json();

      setTotalCultivar(json.totalCultivar);
      setTotalDescarte(json.totalDescarte);
      setPorcentagemAproveitamento(
        (json.beneficiamentoKg / json.colheitaKg) * 100 || 0
      );
      setChartData(json.chartData);
    }

    fetchDashboardData();
  }, [selectedCultivar]);

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Coluna principal */}
      <div className="col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          {/* Selecionar cultivar */}
          <Select value={selectedCultivar} onValueChange={setSelectedCultivar}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Cultivar" />
            </SelectTrigger>
            <SelectContent>
              {/* {cultivars.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))} */}
            </SelectContent>
          </Select>
          <div className="bg-green/20">
            <h2 className="text-lg font-medium">Resumo</h2>
          </div>
        </div>
        <div className="flex justify-between items-center gap-4">
          {/* Card 1 - Total do cultivar */}
          <Card className="flex-1">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="font-normal">Total Cultivar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-medium">{totalCultivar} kg</p>
            </CardContent>
          </Card>

          {/* Card 2 - Total de descarte */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="font-normal">Total Descarte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-medium">{totalDescarte} kg</p>
            </CardContent>
          </Card>

          {/* Card 3 - % de aproveitamento */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="font-normal">Aproveitamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-medium">
                {porcentagemAproveitamento.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico */}
        <StockByProductTypeChart />
      </div>

      {/* Coluna lateral de ações */}
      <div className="col-span-1">
        <Card className="min-h-full flex flex-col">
          <CardHeader>
            <CardTitle className="font-normal">Cadastros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CreateFarmButton />
            <CreatePlotButton />
            <CreateCustomerButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;
