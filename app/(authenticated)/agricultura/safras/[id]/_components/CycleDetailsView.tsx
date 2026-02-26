"use client";

import { CYCLE_STATUS_LABELS } from "@/app/(authenticated)/_constants/cycle";
import { PRODUCT_TYPE_LABELS } from "@/app/(authenticated)/_constants/products";
import { AgroLoader } from "@/components/agro-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCycleById } from "@/queries/registrations/use-cycles-query";
import { CycleDetails } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CornerDownLeft, CornerDownRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeCycleStatus } from "./ChangeCycleStatusBox";

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
          value={CYCLE_STATUS_LABELS[data.status]}
        />
        <Field label="Talhões" value={data.talhoes?.length ?? 0} />
        <Field label="Início" value={startLabel} />
        <Field label="Fim" value={endLabel} />
        <ChangeCycleStatus cycleId={data.id} initialStatus={data.status} />
      </div>
    </section>
  );
}

function PlotsSection({ data }: { data: CycleDetails }) {
  type CycleTalhaoItem = CycleDetails["talhoes"][number];

  const talhoes = data.talhoes ?? [];

  const formatHa = (value: number) =>
    value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const totalArea = talhoes.reduce(
    (acc, t) => acc + Number(t.talhao?.area ?? 0),
    0,
  );

  const grouped = talhoes.reduce<
    Record<string, { farmId: string; farmName: string; items: CycleTalhaoItem[] }>
  >((acc, item) => {
    const farmId = item.talhao?.farm?.id ?? "NO_FARM";
    const farmName = item.talhao?.farm?.name ?? "Sem fazenda";

    if (!acc[farmId]) {
      acc[farmId] = { farmId, farmName, items: [] };
    }

    acc[farmId].items.push(item);
    return acc;
  }, {});

  const farms = Object.values(grouped)
    .map((g) => ({
      ...g,
      items: [...g.items].sort((a, b) =>
        a.talhao.name.localeCompare(b.talhao.name, "pt-BR"),
      ),
    }))
    .sort((a, b) => a.farmName.localeCompare(b.farmName, "pt-BR"));

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">
        <span className="border-b border-green">Talh</span>ões
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        <Field label="Área total (ha)" value={formatHa(totalArea)} />
        <Field label="Quantidade" value={talhoes.length} />
      </div>

      {talhoes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum talhão associado.</p>
      ) : (
        <div className="rounded-md border">
          <div className="overflow-x-auto scrollbar-hide">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Área (ha)</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {farms.flatMap((farm) => {
                  const farmArea = farm.items.reduce(
                    (acc, t) => acc + Number(t.talhao.area ?? 0),
                    0,
                  );

                  return [
                    (
                      <TableRow key={`${farm.farmId}__header`} className="bg-muted/30">
                        <TableCell className="font-medium">
                          <span className="inline-flex items-center gap-2">
                            <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                            {farm.farmName}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatHa(farmArea)}
                        </TableCell>
                      </TableRow>
                    ),
                    ...farm.items.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="pl-10 font-light">
                          {t.talhao.name}
                        </TableCell>
                        <TableCell className="text-right font-light tabular-nums">
                          {formatHa(Number(t.talhao.area ?? 0))}
                        </TableCell>
                      </TableRow>
                    )),
                  ];
                })}
              </TableBody>
            </Table>
          </div>
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