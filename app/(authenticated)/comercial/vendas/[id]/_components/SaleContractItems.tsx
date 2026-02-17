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
import { SaleContractDetails } from "@/types";
import { Separator } from "@/components/ui/separator";
import { SaleContractItemActions } from "./SaleOrderItemsAction";

type Props = {
  saleContract: SaleContractDetails;
};

export function SaleContractItems({ saleContract }: Props) {
  const items = saleContract.items ?? [];
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
          <div className="[&>div]:overflow-x-auto [&>div]:overflow-y-hidden [&>div]:scrollbar-hide">
            <Table className="min-w-[980px]">
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
                  item.product ??
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
                      <SaleContractItemActions
                        item={item}
                        customerId={saleContract.customerId}
                        customerName={saleContract.customer.name}
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
          </div>
        )}
      </>
  );
}