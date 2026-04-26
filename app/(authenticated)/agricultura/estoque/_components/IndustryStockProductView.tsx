"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/app/_helpers/currency";
import { ProductExtractButton } from "./ProductExtractButton";
import { Warehouse, Wheat } from "lucide-react";
import { IndustryGroupedByProduct } from "@/app/_helpers/group-industry-stock-by-product";
import { PRODUCT_TYPE_LABELS } from "@/app/(authenticated)/_constants/products";

export function IndustryStockProductView({ data }: { data: IndustryGroupedByProduct[] }) {
  if (!data.length) return <p>Nenhum estoque encontrado.</p>;

  return (
    <Accordion type="multiple" className="space-y-4">
      {data.map((group) => (
        <AccordionItem
          key={group.product}
          value={group.product}
          className="border rounded-2xl shadow-sm bg-background"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline focus:no-underline">
            <div className="flex w-full justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Wheat size={20} strokeWidth={0.7} />
                  <p className="font-light">{PRODUCT_TYPE_LABELS[group.product]}</p>
                </div>
              </div>

              <span className="font-light">
                Total: {formatNumber(group.total)}
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="grid gap-3 p-4">
              {group.deposits.map((deposit) => (
                <Card key={deposit.depositId}>
                  <CardContent className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-2">
                      <Warehouse size={16} strokeWidth={0.5} />
                      <span className="font-light">{deposit.depositName}</span>
                    </div>

                    <div className="flex items-center gap-6">
                      <span>{formatNumber(deposit.quantity)}</span>

                      <ProductExtractButton
                        product={group.product}
                        depositId={deposit.depositId}
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