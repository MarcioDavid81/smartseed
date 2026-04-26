"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RefreshCw } from "lucide-react";
import { useInputStockQuery } from "@/queries/input/use-input-stock";
import { AgroLoader } from "@/components/agro-loader";
import { groupStockByFarm } from "@/app/_helpers/group-stock-by-farm";
import { groupStockByProduct } from "@/app/_helpers/group-stock-by-product";
import { InputStockFarmView } from "./InputStockFarmView";
import { InputStockProductView } from "./InputStockProductView";
import { StockViewToggle } from "./StockViewToggle";
import GenerateStockReportModal from "./GenerateStockReportModal";

export function InputStockContainer() {
  const [showZero, setShowZero] = useState(false);
  const [viewMode, setViewMode] = useState<"farm" | "product">("farm");

  // persistência
  useEffect(() => {
    const savedZero = localStorage.getItem("showInputZeroStock");
    const savedView = localStorage.getItem("stockViewMode");

    if (savedZero) setShowZero(savedZero === "true");
    if (savedView) setViewMode(savedView as any);
  }, []);

  useEffect(() => {
    localStorage.setItem("showInputZeroStock", String(showZero));
  }, [showZero]);

  useEffect(() => {
    localStorage.setItem("stockViewMode", viewMode);
  }, [viewMode]);

  const { data = [], isLoading, isFetching, refetch } =
    useInputStockQuery({ showZero });

  const groupedByFarm = useMemo(() => groupStockByFarm(data), [data]);
  const groupedByProduct = useMemo(() => groupStockByProduct(data), [data]);

  if (isLoading) return <AgroLoader />;

  return (
    <Card className="p-4 font-light dark:bg-primary">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-light">Estoque de Insumos</h2>

          <Button variant="ghost" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
          </Button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <StockViewToggle value={viewMode} onChange={setViewMode} />

          <div className="flex items-center gap-2">
            <span className="text-sm">Exibir zerados</span>
            <Switch checked={showZero} onCheckedChange={setShowZero} />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-4 my-4 h-[68vh] overflow-auto scrollbar-hide">
        {viewMode === "farm" ? (
          <InputStockFarmView data={groupedByFarm} />
        ) : (
          <InputStockProductView data={groupedByProduct} />
        )}
      </div>

      <GenerateStockReportModal />
    </Card>
  );
}