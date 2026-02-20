"use client";

import { PRODUCT_CLASS_LABELS } from "@/app/(authenticated)/_constants/insumos";
import { formatCurrency, formatNumber } from "@/app/_helpers/currency";
import { AgroLoader } from "@/components/agro-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useInputPurchase } from "@/queries/input/use-input-purchase";
import { PurchaseDetails } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CornerDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-medium">{value ?? "-"}</p>
    </div>
  );
}

function MainDataSection({ data }: { data: PurchaseDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Dados</span> Principais</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Produto" value={data.product.name} />
        <Field label="Classe" value={PRODUCT_CLASS_LABELS[data.product.class]} />
      </div>
    </section>
  );
}

function CustomerSection({ data }: { data: PurchaseDetails }) {
  const c = data.customer;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Forne</span>cedor</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Nome" value={c.name} />
        <Field label="CNPJ/CPF" value={c.cpf_cnpj} />
        <Field label="Endereço" value={c.adress} />
        <Field label="Cidade" value={`${c.city} - ${c.state}`} />
        <Field label="Telefone" value={c.phone} />
        <Field label="Email" value={c.email} />
      </div>
    </section>
  );
}

function WeightSection({ data }: { data: PurchaseDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Pesa</span>gem</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Quantidade" value={formatNumber(data.quantity) + " " + data.product.unit} />
      </div>
    </section>
  );
}

function FinancialSection({ data }: { data: PurchaseDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Finan</span>ceiro</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <Field label="Preço unitário" value={formatCurrency(data.unitPrice)} />
        <Field label="Valor total" value={formatCurrency(data.totalPrice)} />
        <Field
          label="Vencimento"
          value={
            data.dueDate
              ? format(new Date(data.dueDate), "dd/MM/yyyy")
              : "-"
          }
        />
      </div>
    </section>
  );
}


type Props = {
  id: string;
};

export function InputPurchaseDetailsView({ id }: Props) {
  const { data, isLoading } = useInputPurchase(id);
  const router = useRouter();
  const handleReturn = () => {
    router.push("/insumos/compras");
  }

  if (isLoading) return <AgroLoader />;
  if (!data) return <p>Compra não encontrada</p>;

  return (
    <div className="w-full mx-auto py-2 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            Nota de Compra - NF {data.invoiceNumber}
          </CardTitle>

          <p className="text-xs font-light text-muted-foreground">
            Emitida em{" "}
            {format(new Date(data.date), "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">

          <MainDataSection data={data} />
          <Separator />

          <CustomerSection data={data} />
          <Separator />

          <WeightSection data={data} />
          <Separator />

          <FinancialSection data={data} />
          <Separator />

        <Button type="button" className="max-w-[100px] bg-green text-white mt-4 font-light" onClick={handleReturn}>
          <CornerDownLeft size={20} />
            Voltar
        </Button>
        </CardContent>
      </Card>
    </div>
  );
}
