"use client";

import { PRODUCT_TYPE_LABELS } from "@/app/(authenticated)/_constants/products";
import { AgroLoader } from "@/components/agro-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCycleById } from "@/queries/registrations/use-cycles-query";
import { CycleDetails } from "@/types";
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

function MainDataSection({ data }: { data: CycleDetails }) {
  const start = data.startDate ? new Date(data.startDate) : null;
  const end = data.endDate ? new Date(data.endDate) : null;

  const startLabel = start
    ? format(start, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "-";

  const endLabel = end
    ? format(end, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "-";

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">
        <span className="border-b border-green">Dados</span> Principais
      </h2>

      <div className="grid md:grid-cols-4 gap-6">
        <Field label="Nome" value={data.name} />
        <Field
          label="Tipo de produto"
          value={PRODUCT_TYPE_LABELS[data.productType] ?? data.productType}
        />
        <Field
          label="Status"
          value={data.isActive ? "Ativa" : "Inativa"}
        />
        <Field label="Talhões" value={data.talhoes?.length ?? 0} />
        <Field label="Início" value={startLabel} />
        <Field label="Fim" value={endLabel} />
      </div>
    </section>
  );
}

function PlotsSection({ data }: { data: CycleDetails }) {
  const talhoes = data.talhoes ?? [];
  const totalArea = talhoes.reduce(
    (acc, t) => acc + Number(t.talhao?.area ?? 0),
    0,
  );

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">
        <span className="border-b border-green">Talh</span>ões
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        <Field label="Área total (ha)" value={totalArea.toFixed(2)} />
        <Field label="Quantidade" value={talhoes.length} />
      </div>

      {talhoes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum talhão associado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {talhoes.map((t) => (
            <div
              key={t.id}
              className="rounded-lg border bg-muted/20 p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{t.talhao.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t.talhao.farm?.name ?? "-"}
                  </p>
                </div>
                <p className="text-sm font-medium tabular-nums whitespace-nowrap">
                  {Number(t.talhao.area ?? 0).toFixed(2)} ha
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type Props = {
  id: string;
};

export function CycleDetailsView({ id }: Props) {
  const { data, isLoading } = useCycleById(id);
  const router = useRouter();

  const handleReturn = () => {
    router.push("/agricultura/safras");
  };

  if (isLoading) return <AgroLoader />;
  if (!data) return <p>Safra não encontrada</p>;

  const startShort = data.startDate
    ? format(new Date(data.startDate), "dd/MM/yyyy")
    : "-";

  return (
    <div className="w-full mx-auto py-2 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            Safra / Ciclo - {data.name}
          </CardTitle>

          <p className="text-xs font-light text-muted-foreground">
            Início em {startShort}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <MainDataSection data={data} />
          <Separator />

          <PlotsSection data={data} />
          <Separator />

          <Button
            type="button"
            className="max-w-[100px] bg-green text-white mt-4 font-light"
            onClick={handleReturn}
          >
            <CornerDownLeft size={20} />
            Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}