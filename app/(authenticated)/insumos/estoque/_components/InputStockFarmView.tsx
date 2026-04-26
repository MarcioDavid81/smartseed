"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Warehouse } from "lucide-react";
import { formatNumber } from "@/app/_helpers/currency";
import { InputExtractButton } from "./InputExtractButton";
import { PRODUCT_CLASS_LABELS } from "@/app/(authenticated)/_constants/insumos";
import { GroupedStock } from "@/app/_helpers/group-stock-by-farm";

export function InputStockFarmView({ data }: { data: GroupedStock[] }) {
  if (!data.length) return <p>Nenhum estoque encontrado.</p>;

  return (
    <Accordion type="multiple" className="space-y-4">
      {data.map((farmGroup) => (
        <AccordionItem
          key={farmGroup.farm.id}
          value={farmGroup.farm.id}
          className="border rounded-2xl shadow-sm bg-background"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline focus:no-underline">
            <div className="flex w-full justify-between">
              <div className="flex items-center gap-3">
                <span className="font-light">
                  {farmGroup.farm.name}
                </span>
              </div>

              <span className="font-light">
                Total: {formatNumber(farmGroup.total)}
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="grid gap-3 p-4">
              {farmGroup.products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="flex justify-between items-center p-4">
                    <div className="flex gap-3">
                      <Package size={16} />
                      <div>
                        <p>{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {PRODUCT_CLASS_LABELS[product.class as keyof typeof PRODUCT_CLASS_LABELS]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p>{formatNumber(product.stock)}</p>
                        <p className="text-xs">{product.unit}</p>
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
  );
}