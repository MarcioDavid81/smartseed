"use client";

import { CommercialStatusBadge } from "@/app/(authenticated)/_components/CommercialStatusBadge";
import { SALE_TYPE_LABELS } from "@/app/(authenticated)/_constants/commercial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CornerDownLeft, RefreshCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SaleContractDetails } from "@/types";
import { SaleContractItems } from "./SaleContractItems";

type Props = {
  saleContract: SaleContractDetails;
};

export function SaleContractOverview({ saleContract }: Props) {
    const router = useRouter();

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const handleReturn = () => {
    router.push("/comercial/vendas");
  }

  return (
    <Card className="overflow-x-auto overflow-y-hidden scrollbar-hide">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            Contrato {saleContract.document}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleRefreshPage} className="text-sm text-primary">
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Atualizar página</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CommercialStatusBadge status={saleContract.status} />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 text-sm">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex flex-col gap-6 w-[50%]">
            <div>
              <span className="text-muted-foreground">Cliente</span>
              <p className="font-medium">{saleContract.customer.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Data</span>
              <p>{new Date(saleContract.date).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-6 w-[50%]">
            <div>
              <span className="text-muted-foreground">Tipo</span>
              <p>{SALE_TYPE_LABELS[saleContract.type]}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Observações</span>
              <p>{saleContract.notes || "—"}</p>
            </div>
          </div>
        </div>
        <div>
          <SaleContractItems saleContract={saleContract} />
        </div>
        <Button type="button" className="max-w-[100px] bg-green text-white mt-4 font-light" onClick={handleReturn}>
          <CornerDownLeft size={20} />
            Voltar
        </Button>
      </CardContent>
    </Card>
  );
}
