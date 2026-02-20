"use client";

import { formatCurrency, formatNumber } from "@/app/_helpers/currency";
import { AgroLoader } from "@/components/agro-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSeedBuy } from "@/queries/seed/use-seed-buy-query";
import { BuyDetails, SaleDetails } from "@/types";
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

function MainDataSection({ data }: { data: BuyDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Dados</span> Principais</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Produto" value={data.cultivar.product} />
        <Field label="Cultivar" value={data.cultivar.name} />
      </div>
    </section>
  );
}

function CustomerSection({ data }: { data: BuyDetails }) {
  const c = data.customer;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Desti</span>natário</h2>

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

function WeightSection({ data }: { data: BuyDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Pesa</span>gem</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Peso bruto (kg)" value={formatNumber(data.quantityKg)} />
      </div>
    </section>
  );
}

function FinancialSection({ data }: { data: BuyDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Finan</span>ceiro</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <Field label="Preço unitário" value={formatCurrency(data.unityPrice)} />
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

export function SeedBuyDetailsView({ id }: Props) {
  const { data, isLoading } = useSeedBuy(id);
  const router = useRouter();
  const handleReturn = () => {
    router.push("/sementes/compras");
  }

  if (isLoading) return <AgroLoader />;
  if (!data) return <p>Compra não encontrada</p>;

  return (
    <div className="w-full mx-auto py-2 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            Nota de Compra - NF {data.invoice}
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
