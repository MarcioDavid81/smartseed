"use client";

import { formatCurrency } from "@/app/_helpers/currency";
import { Button } from "@/components/ui/button";
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
import { PurchaseOrderItemDetail } from "@/types/purchaseOrderItemDetail";
import { ChevronRight } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PurchaseOrderItemDetail;
};

export function PurchaseOrderItemDeliveries({
  open,
  onOpenChange,
  item,
}: Props) {
  const deliveries = item.deliveries ?? [];
  const title = item.product?.name ?? item.cultivar?.name ?? "Remessas";

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
          <div className="h-[70vh] max-h-[80vh] overflow-y-auto pr-2">
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
                      <Button
                        variant="outline"
                        className="rounded-full border-green text-green hover:bg-emerald-50 hover:text-green"
                      >
                        Nota Fiscal
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={-3} className="text-start">
                    Total
                  </TableCell>
                  <TableCell colSpan={2} className="text-right tabular-nums">
                    {deliveries.reduce(
                      (acc, cur) => acc + Number(cur.quantity),
                      0,
                    ).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell colSpan={1} className="text-right tabular-nums">
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
