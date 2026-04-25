"use client";

import { useEffect, useMemo, useState } from "react";
import { groupStockByFarm } from "@/app/_helpers/group-stock-by-farm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Package, RefreshCw, Warehouse } from "lucide-react";
import { formatNumber } from "@/app/_helpers/currency";
import { useInputStockQuery } from "@/queries/input/use-input-stock";
import { InputExtractButton } from "./InputExtractButton";
import { AgroLoader } from "@/components/agro-loader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function InputStockByFarmAccordion() {
  const [showZero, setShowZero] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("showInputZeroStock");
    if (saved) setShowZero(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("showInputZeroStock", String(showZero));
  }, [showZero]);
  const { data = [], isLoading, isFetching, refetch } = useInputStockQuery({
    showZero,
  });

  const grouped = useMemo(() => {
    return groupStockByFarm(data);
  }, [data]);

  if (isLoading) {
    return <AgroLoader />;
  }

  if (!grouped.length) {
    return <p>Nenhum estoque encontrado.</p>;
  }

  return (
    <Card className="p-4 font-light dark:bg-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-light">Estoque de Insumos</h2>
          <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Exibir zerados</span>
          <Switch
            checked={showZero}
            onCheckedChange={setShowZero}
          />
        </div>
      </div>
      <Accordion type="multiple" className="space-y-4 mt-4">
        {grouped.map((farmGroup) => (
          <AccordionItem
            key={farmGroup.farm.id}
            value={farmGroup.farm.id}
            className="border rounded-2xl shadow-sm bg-background"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex w-full items-center justify-between">
                {/* Fazenda */}
                <div className="flex items-center gap-3">
                  <Warehouse size={20} />
                  <span className="font-light text-base">
                    {farmGroup.farm.name}
                  </span>
                </div>
                {/* Total */}
                <div className="text-sm text-muted-foreground">
                  Total:{" "}
                  <span className="font-semibold text-foreground">
                    {formatNumber(farmGroup.total)}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-3 p-4">
                {farmGroup.products.map((product) => (
                  <Card key={product.id} className="rounded-xl">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.class}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-8">
                        <div className="flex flex-col items-end">
                          <p className="font-semibold">
                            {formatNumber(product.stock)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.unit}
                          </p>
                        </div>
                        <InputExtractButton
                          productId={product.productId}
                          farmId={farmGroup.farm.id}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}