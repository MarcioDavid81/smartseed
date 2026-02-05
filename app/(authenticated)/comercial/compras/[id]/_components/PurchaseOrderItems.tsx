import { formatCurrency } from "@/app/_helpers/currency";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PurchaseOrderDetails } from "@/types";
import { PurchaseOrderItemActions } from "./PurchaseOrderItemsAction";
import { Separator } from "@/components/ui/separator";

type Props = {
  purchaseOrder: PurchaseOrderDetails;
};

export function PurchaseOrderItems({ purchaseOrder }: Props) {
  const items = purchaseOrder.items ?? [];
  const totalValue = items.reduce(
    (acc, item) => acc + Number(item.totalPrice ?? 0),
    0,
  );

  return (
      <>
        <Separator className="mt-4 mb-10" />
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Nenhum item informado.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Unid.</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Atendido</TableHead>
                <TableHead className="text-right">Restante</TableHead>
                <TableHead className="text-right">Preço Unitário (R$)</TableHead>
                <TableHead className="text-right">Preço Total (R$)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item) => {
                const label =
                  item.product?.name ??
                  item.cultivar?.name ??
                  item.description ??
                  "—";

                const remaining = Number(item.remainingQuantity);
                const unityPrice = item.unityPrice;
                const totalPrice = item.totalPrice;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-light">{label}</TableCell>
                    <TableCell className="text-right font-light">{item.unit}</TableCell>
                    <TableCell className="text-right tabular-nums font-light">
                      {Number(item.quantity).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-light">
                      {Number(item.fulfilledQuantity).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-light">
                      {remaining.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>

                    <TableCell className="text-right tabular-nums font-light">
                      {formatCurrency(unityPrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-light">
                      {formatCurrency(totalPrice)}
                    </TableCell>
                    <TableCell className="text-right font-light">
                      <PurchaseOrderItemActions
                        item={item}
                        customerId={purchaseOrder.customerId}
                        customerName={purchaseOrder.customer.name}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TableCell className="text-left font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums" colSpan={6}>
                  {formatCurrency(totalValue)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </>
  );
}