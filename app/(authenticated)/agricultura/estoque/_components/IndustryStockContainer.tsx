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
import GenerateStockReportModal from "./GenerateStockReportModal";
import { IndustryStockViewToggle } from "./IndustryStockViewToggle";
import { IndustryStockDepositView } from "./IndustryStockDepositView";
import { IndustryStockProductView } from "./IndustryStockProductView";
import { useIndustryStock } from "@/queries/industry/use-stock-query";
import { groupIndustryStockByDeposit } from "@/app/_helpers/group-industry-stock-by-deposit";
import { groupIndustryStockByProduct } from "@/app/_helpers/group-industry-stock-by-product";

export function IndustryStockContainer() {
  const [showZero, setShowZero] = useState(false);
  const [viewMode, setViewMode] = useState<"deposit" | "product">("deposit");

  // persistência
  useEffect(() => {
    const savedZero = localStorage.getItem("showIndustryZeroStock");
    const savedView = localStorage.getItem("industryStockViewMode");

    if (savedZero) setShowZero(savedZero === "true");
    if (savedView) setViewMode(savedView as any);
  }, []);

  useEffect(() => {
    localStorage.setItem("showIndustryZeroStock", String(showZero));
  }, [showZero]);

  useEffect(() => {
    localStorage.setItem("industryStockStockViewMode", viewMode);
  }, [viewMode]);

  const { data = [], isLoading, isFetching, refetch } =
    useIndustryStock({ showZero });

  const groupedByDeposit = useMemo(() => groupIndustryStockByDeposit(data), [data]);
  const groupedByProduct = useMemo(() => groupIndustryStockByProduct(data), [data]);

  if (isLoading) return <AgroLoader />;

  return (
    <Card className="p-4 font-light dark:bg-primary">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-light">Estoque de Produtos</h2>

          <Button variant="ghost" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
            />
          </Button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <IndustryStockViewToggle value={viewMode} onChange={setViewMode} />

          <div className="flex items-center gap-2">
            <span className="text-sm">Exibir zerados</span>
            <Switch checked={showZero} onCheckedChange={setShowZero} />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-4 my-4 h-[68vh] overflow-auto scrollbar-hide">
        {viewMode === "deposit" ? (
          <IndustryStockDepositView data={groupedByDeposit} />
        ) : (
          <IndustryStockProductView data={groupedByProduct} />
        )}
      </div>

      <GenerateStockReportModal />
    </Card>
  );
}