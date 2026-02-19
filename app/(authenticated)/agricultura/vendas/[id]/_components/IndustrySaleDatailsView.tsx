"use client";

import { AgroLoader } from "@/components/agro-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIndustrySale } from "@/queries/industry/use-sale-query";
import { IndustrySaleDetails } from "@/types";
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

function MainDataSection({ data }: { data: IndustrySaleDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Dados</span> Principais</h2>

      <div className="grid md:grid-cols-4 gap-6">
        <Field label="Produto" value={data.product} />
        <Field label="Depósito" value={data.industryDeposit.name} />
        <Field label="Transportador" value={data.industryTransporter.name} />
        <Field label="Placa do caminhão" value={data.truckPlate} />
      </div>
    </section>
  );
}

function CustomerSection({ data }: { data: IndustrySaleDetails }) {
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

function WeightSection({ data }: { data: IndustrySaleDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Pesa</span>gem</h2>

      <div className="grid md:grid-cols-4 gap-6">
        <Field label="Peso bruto (kg)" value={data.weightBt} />
        <Field label="Tara (kg)" value={data.weightTr} />
        <Field label="Peso líquido (kg)" value={data.weightLiq} />
        <Field label="Descontos (kg)" value={data.discountsKg ?? 0} />
      </div>
    </section>
  );
}

function FinancialSection({ data }: { data: IndustrySaleDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Finan</span>ceiro</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <Field label="Preço unitário" value={`R$ ${data.unitPrice.toFixed(3)}`} />
        <Field label="Valor total" value={`R$ ${data.totalPrice.toFixed(2)}`} />
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

export function IndustrySaleDetailsView({ id }: Props) {
  const { data, isLoading } = useIndustrySale(id);
  const router = useRouter();
  const handleReturn = () => {
    router.push("/agricultura/vendas");
  }

  if (isLoading) return <AgroLoader />;
  if (!data) return <p>Venda não encontrada</p>;

  return (
    <div className="w-full mx-auto py-2 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            Nota de Venda - NF {data.document}
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
