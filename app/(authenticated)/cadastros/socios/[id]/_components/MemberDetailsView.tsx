"use client";

import { AgroLoader } from "@/components/agro-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMember } from "@/queries/registrations/use-member";
import { Member } from "@/types";
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
      <p className="font-medium break-words">{value ?? "-"}</p>
    </div>
  );
}

function MainDataSection({ data }: { data: Member }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">
        <span className="border-b border-green">Dados</span> Principais
      </h2>

      <div className="grid md:grid-cols-4 gap-6">
        <Field label="Nome" value={data.name} />
        <Field label="CPF" value={data.cpf} />
        <Field label="Email" value={data.email} />
        <Field label="Telefone" value={data.phone} />
      </div>
    </section>
  );
}

function AddressCard({
  index,
  address,
}: {
  index: number;
  address: Member["adresses"][number];
}) {
  const title =
    address.stateRegistration && address.stateRegistration.trim()
      ? `Endereço ${index + 1} — IE: ${address.stateRegistration}`
      : `Endereço ${index + 1}`;

  const enderecoLinha = [
    address.adress,
    address.number ? `nº ${address.number}` : null,
    address.complement ? `(${address.complement})` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const cidadeUf = [address.city, address.state].filter(Boolean).join(" / ");

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-4">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-4 gap-6">
          <Field label="CEP" value={address.zip} />
          <Field label="Bairro" value={address.district} />
          <Field label="Cidade/UF" value={cidadeUf} />
          <Field label="Inscrição Estadual" value={address.stateRegistration} />
        </div>

        <Separator />

        <div className="grid md:grid-cols-1 gap-6">
          <Field label="Endereço" value={enderecoLinha} />
        </div>
      </CardContent>
    </Card>
  );
}

function AddressesSection({ data }: { data: Member }) {
  const adresses = data.adresses ?? [];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">
        <span className="border-b border-green">Ende</span>reços
      </h2>

      {adresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum endereço cadastrado.
        </p>
      ) : (
        <div className="space-y-4">
          {adresses.map((address, index) => (
            <AddressCard key={address.id} index={index} address={address} />
          ))}
        </div>
      )}
    </section>
  );
}

type Props = {
  id: string;
};

export function MemberDetailsView({ id }: Props) {
  const { data, isLoading } = useMember(id);
  const router = useRouter();

  if (isLoading) return <AgroLoader />;
  if (!data) return <p>Sócio não encontrado</p>;

  return (
    <div className="w-full mx-auto py-2 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-hide">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            Sócio - {data.name}
          </CardTitle>
          <p className="text-xs font-light text-muted-foreground">
            {data.cpf ? `CPF: ${data.cpf}` : "-"}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <MainDataSection data={data} />
          <Separator />
          <AddressesSection data={data} />

          <Button
            type="button"
            className="max-w-[100px] bg-green text-white mt-4 font-light"
            onClick={() => router.push("/cadastros/socios")}
          >
            <CornerDownLeft size={20} />
            Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}