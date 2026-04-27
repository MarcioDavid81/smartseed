"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/app/_helpers/currency";
import { InputExtractButton } from "./InputExtractButton";
import { PRODUCT_CLASS_LABELS } from "@/app/(authenticated)/_constants/insumos";
import { GroupedByProduct } from "@/app/_helpers/group-stock-by-product";
import { BugPlay } from "lucide-react";
import { PiFarmThin } from "react-icons/pi";
import { StockActionsDropdown } from "./StockActionsDropdown";

export function InputStockProductView({ data }: { data: GroupedByProduct[] }) {
  if (!data.length) return <p>Nenhum estoque encontrado.</p>;

  return (
    <Accordion type="multiple" className="space-y-4">
      {data.map((group) => (
        <AccordionItem
          key={group.product.id}
          value={group.product.id}
          className="border rounded-2xl shadow-sm bg-background"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline focus:no-underline">
            <div className="flex w-full justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <BugPlay size={20} strokeWidth={0.7} className="text-black" />
                  <p className="font-light">{group.product.name}</p>
                </div>
                <p className="font-light text-xs text-muted-foreground">
                  {PRODUCT_CLASS_LABELS[group.product.class as keyof typeof PRODUCT_CLASS_LABELS]}
                </p>
              </div>

              <span className="font-light">
                Total: {formatNumber(group.total)}
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="grid gap-3 p-4">
              {group.farms.map((farm) => (
                <Card key={farm.id}>
                  <CardContent className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-2">
                      <PiFarmThin size={20} strokeWidth={0.5} className="text-muted-foreground" />
                      <span className="font-light">{farm.farmName}</span>
                    </div>

                    <div className="flex items-center gap-6">
                      <span>{formatNumber(farm.stock)}</span>

                      <StockActionsDropdown
                        productId={group.product.id}
                        farmId={farm.farmId}
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