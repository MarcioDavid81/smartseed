"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Warehouse, Wheat } from "lucide-react";
import { formatNumber } from "@/app/_helpers/currency";
import { ProductExtractButton } from "./ProductExtractButton";
import { IndustryGroupedStock } from "@/app/_helpers/group-industry-stock-by-deposit";
import { PRODUCT_TYPE_LABELS } from "@/app/(authenticated)/_constants/products";

export function IndustryStockDepositView({ data }: { data: IndustryGroupedStock[] }) {
  if (!data.length) return <p>Nenhum estoque encontrado.</p>;

  return (
    <Accordion type="multiple" className="space-y-4">
      {data.map((depositGroup) => (
        <AccordionItem
          key={depositGroup.deposit.id}
          value={depositGroup.deposit.id}
          className="border rounded-2xl shadow-sm bg-background"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline focus:no-underline">
            <div className="flex w-full justify-between">
              <div className="flex items-center gap-3">
                <Warehouse size={20} strokeWidth={0.7} />
                <span className="font-light">
                  {depositGroup.deposit.name}
                </span>
              </div>

              <span className="font-light">
                Total: {formatNumber(depositGroup.total)}
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="grid gap-3 p-4">
              {depositGroup.products.map(({ product, quantity }) => (
                <Card key={product}>
                  <CardContent className="flex justify-between items-center p-4">
                    <div className="flex gap-3">
                      <Wheat size={16} strokeWidth={0.5} />
                      <div>
                        <p>{PRODUCT_TYPE_LABELS[product]}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p>{formatNumber(quantity)}</p>
                      </div>

                      <ProductExtractButton
                        product={product}
                        depositId={depositGroup.deposit.id}
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