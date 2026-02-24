"use client";

import { PRODUCT_TYPE_LABELS } from "@/app/(authenticated)/_constants/products";
import { AgroLoader } from "@/components/agro-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIndustryHarvest } from "@/queries/industry/use-harvest-query";
import { IndustryHarvestDetails } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CornerDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import GenerateRomaneioButton from "../../_components/GenerateRomaneioButton";
import { formatNumber } from "@/app/_helpers/currency";

function Field({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string | number | null;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="font-medium">{value ?? "-"}</p>
    </div>
  );
}

function MainDataSection({ data }: { data: IndustryHarvestDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Dados</span> Principais</h2>

      <div className="grid md:grid-cols-4 gap-6">
        <Field label="Produto" value={PRODUCT_TYPE_LABELS[data.product]} />
        <Field label="Depósito" value={data.industryDeposit.name} />
        <Field label="Transportador" value={data.industryTransporter?.name ?? "Sem transport"} />
        <Field label="Placa do caminhão" value={data.truckPlate} />
      </div>
    </section>
  );
}

function OriginSection({ data }: { data: IndustryHarvestDetails }) {
  const t = data.talhao;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Ori</span>gem</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Fazenda" value={t.farm.name} />
        <Field label="Talhão" value={t.name} />
      </div>
    </section>
  );
}

function WeightSection({ data }: { data: IndustryHarvestDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Pesa</span>gem</h2>

      <div className="grid md:grid-cols-4 gap-6">
        <Field label="Peso bruto (kg)" value={formatNumber(data.weightBt)} />
        <Field label="Tara (kg)" value={formatNumber(data.weightTr)} />
        <Field label="Impureza (kg)" value={formatNumber(data.impurities_kg ?? 0)} />
        <Field label="Umidade (kg)" value={formatNumber(data.humidity_kg ?? 0)} />
        <Field label="Taxas (kg)" value={formatNumber(data.tax_kg ?? 0)} />
        <Field label="Ajuste (kg)" value={formatNumber(data.adjust_kg ?? 0)} />
        <Field label="Peso líquido (kg)" value={formatNumber(data.weightLiq)} className="md:col-span-2 md:ml-40" />
      </div>
    </section>
  );
}

type Props = {
  id: string;
};

export function IndustryHarvestDetailsView({ id }: Props) {
  const { data, isLoading } = useIndustryHarvest(id);
  const router = useRouter();
  const handleReturn = () => {
    router.push("/agricultura/colheitas");
  }

  if (isLoading) return <AgroLoader />;
  if (!data) return <p>Colheita não encontrada</p>;

  return (
    <div className="w-full mx-auto py-2 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            Documento de Colheita- ROMANEIO {data.document}
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

          <OriginSection data={data} />
          <Separator />

          <WeightSection data={data} />
          <Separator />

        <div className="flex items-center justify-between">
          <GenerateRomaneioButton harvest={data} />
          <Button type="button" className="max-w-[100px] bg-green text-white font-light" onClick={handleReturn}>
            <CornerDownLeft size={20} />
              Voltar
          </Button>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
