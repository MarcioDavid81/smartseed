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
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Origem</span> do Talhão</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Field label="Nome" value={t.name} />
        <Field label="CNPJ/CPF" value={t.farm.name} />
      </div>
    </section>
  );
}

function WeightSection({ data }: { data: IndustryHarvestDetails }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold"><span className="border-b border-green">Pesa</span>gem</h2>

      <div className="grid md:grid-cols-4 gap-6">
        <Field label="Peso bruto (kg)" value={data.weightBt} />
        <Field label="Tara (kg)" value={data.weightTr} />
        <Field label="Peso líquido (kg)" value={data.weightLiq} />
      </div>
    </section>
  );
}

// function FinancialSection({ data }: { data: IndustryHarvestDetails }) {
//   return (
//     <section className="space-y-4">
//       <h2 className="text-lg font-semibold"><span className="border-b border-green">Finan</span>ceiro</h2>

//       <div className="grid md:grid-cols-3 gap-6">
//         <Field label="Preço unitário" value={`R$ ${data.unitPrice.toFixed(3)}`} />
//         <Field label="Valor total" value={`R$ ${data.totalPrice.toFixed(2)}`} />
//         <Field
//           label="Vencimento"
//           value={
//             data.dueDate
//               ? format(new Date(data.dueDate), "dd/MM/yyyy")
//               : "-"
//           }
//         />
//       </div>
//     </section>
//   );
// }


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

          {/* <FinancialSection data={data} /> */}
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
