"use client";

import { formatCurrency } from "@/app/_helpers/currency";
import { generateSaleDeliveriesReport } from "@/app/_helpers/generate-deliveries-report";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SaleContractItemDetail } from "@/types/saleContractItemDetail";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SaleContractItemDetail;
  contractNumber?: string;
  contractDate?: Date;
  customerName?: string;
  memberName?: string;
};

function loadLogo(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar logo"));
  });
}

export function SaleContracItemDeliveries({
  open,
  onOpenChange,
  item,
  contractNumber,
  contractDate,
  customerName,
  memberName,
}: Props) {
  const deliveries = item.deliveries ?? [];
  const title = item.product ?? item.cultivar?.name ?? "Remessas";
  const { user } = useUser();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const company = user?.company?.name;
      const userName = user?.name;

      const logo = company ? await loadLogo("/6.png") : undefined;

      generateSaleDeliveriesReport(item, {
        contractNumber,
        contractDate,
        customerName,
        memberName,
        company: company ?? undefined,
        userName,
        logo,
        subtitle: title,
      });
    } finally {
      setIsPrinting(false);
    }
  };

  // Função para determinar o link baseado no tipo de item
  const getDeliveryLink = (deliveryId: string) => {
    if (item.cultivar) {
      return `/sementes/vendas/${deliveryId}`;
    }
    // Se for product ou qualquer outro caso
    return `/agricultura/vendas/${deliveryId}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {deliveries.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            Nenhuma remessa registrada para este item.
          </div>
        ) : (
          <div className="h-[70vh] max-h-[80vh] overflow-y-auto pr-2 scrollbar-hide">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead className="text-right">
                    Quantidade ({deliveries[0]?.unit ?? ""})
                  </TableHead>
                  <TableHead className="text-right">Valor total (R$)</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      {new Date(delivery.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{delivery.invoice || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(delivery.quantity).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(delivery.totalPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={getDeliveryLink(delivery.id)}>
                        <Button
                          variant="outline"
                          className="rounded-full border-green text-green hover:bg-emerald-50 hover:text-green"
                        >
                          Nota Fiscal
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="text-start">
                    Total
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {deliveries.reduce(
                      (acc, cur) => acc + Number(cur.quantity),
                      0,
                    ).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(
                      deliveries.reduce(
                        (acc, cur) => acc + cur.totalPrice,
                        0,
                      ),
                    )}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
        <div className="flex justify-end mt-4">
          <Button onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? "Gerando…" : "Imprimir relatório"}
          </Button>
        </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}