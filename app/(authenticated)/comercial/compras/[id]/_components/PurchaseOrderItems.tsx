import { formatCurrency } from "@/app/_helpers/currency";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PurchaseOrderDetails } from "@/types";
import { PurchaseOrderItemActions } from "./PurchaseOrderItemsAction";

type Props = {
  purchaseOrder: PurchaseOrderDetails;
};

export function PurchaseOrderItems({ purchaseOrder }: Props) {
  const items = purchaseOrder.items ?? [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Itens</CardTitle>
      </CardHeader>

      <CardContent>
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
                const unityPrice = (item.unityPrice)
                const totalPrice = (item.totalPrice)

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{label}</TableCell>
                    <TableCell className="text-right">{item.unit}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(item.quantity).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(item.fulfilledQuantity).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {remaining.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>

                    <TableCell className="text-right">
                      {formatCurrency(unityPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totalPrice)} 
                    </TableCell>
                    <TableCell className="text-right">
                      <PurchaseOrderItemActions
                        item={item}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}