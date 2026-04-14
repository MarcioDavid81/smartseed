"use client";

import { formatCurrency, formatNumber } from "@/app/_helpers/currency";
import { AgroLoader } from "@/components/agro-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMaintenanceById } from "@/queries/machines/use-maintenance-query";
import { MaintenanceDetails } from "@/types";
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

function MainDataSection({ data }: { data: MaintenanceDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Dado</span>s Principais</h2>

      <div className="grid grid-cols-1 gap-6">
        <Field label="Tipo" value={data.description ?? "-"} />
      </div>
    </section>
  );
}

function MemberSection({ data }: { data: MaintenanceDetails }) {
  const m = data.member;
  const mA = data.memberAdress;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">
        <span className="border-b border-green">Sóci</span>o
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Nome" value={m?.name ?? "-"} />
        <Field label="CNPJ/CPF" value={m?.cpf ?? "-"} />
        <Field label="Endereço" value={mA?.adress ?? "-"} />

        <Field
          label="Cidade"
          value={
            mA?.city && mA?.state
              ? `${mA.city} - ${mA.state}`
              : "-"
          }
        />

        <Field
          label="Inscrição Estadual"
          value={mA?.stateRegistration ?? "-"}
        />
      </div>
    </section>
  );
}

function CustomerSection({ data }: { data: MaintenanceDetails }) {
  const c = data.customer;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Pres</span>tador</h2>

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

function WeightSection({ data }: { data: MaintenanceDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Deta</span>lhes</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Manutenção" value={data.description} />
      </div>
    </section>
  );
}

function FinancialSection({ data }: { data: MaintenanceDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Fina</span>nceiro</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Valor total" value={formatCurrency(data.totalValue)} />
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

export function MaintenanceDetailsView({ id }: Props) {
  const { data, isLoading } = useMaintenanceById(id);
  const router = useRouter();
  const handleReturn = () => {
    router.push("/maquinas/manutencoes");
  }

  if (isLoading) return <AgroLoader />;
  if (!data) return <p>Manutenção não encontrada</p>;

  return (
    <div className="w-full mx-auto py-2 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            Manutenção
          </CardTitle>

          <p className="text-xs font-light text-muted-foreground">
            Realizada em{" "}
            {format(new Date(data.date), "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">

          <MainDataSection data={data} />
          <Separator />

          <MemberSection data={data} />
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
