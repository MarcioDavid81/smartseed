"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getToken } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import InputMask from "react-input-mask";
import { toast } from "sonner";
import { z } from "zod";

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StateUF {
  id: number;
  sigla: string;
  nome: string;
}

interface City {
  id: number;
  nome: string;
}

const customerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  adress: z.string().min(1, "Endereço é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  phone: z.string().min(14, "Telefone inválido"),
  cpf_cnpj: z
    .string()
    .min(14, "CPF/CNPJ inválido")
    .refine(
      (val) =>
        val.replace(/\D/g, "").length === 14 ||
        val.replace(/\D/g, "").length === 11,
      "CPF ou CNPJ inválido",
    ),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const NewCustomerModal = ({ isOpen, onClose }: NewCustomerModalProps) => {
  const [statesList, setStatesList] = useState<StateUF[]>([]);
  const [citiesList, setCitiesList] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [personType, setPersonType] = useState<"fisica" | "juridica">("fisica");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const currentState = watch("state");

  useEffect(() => {
    if (isOpen) {
      fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
        .then((res) => res.json())
        .then((data: StateUF[]) => {
          const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome));
          setStatesList(sorted);
        })
        .catch(() => toast.error("Erro ao carregar estados"));
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentState) {
      fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${currentState}/municipios`,
      )
        .then((res) => res.json())
        .then((data: City[]) => {
          const sorted = data.sort((a, b) => a.nome.localeCompare(b.nome));
          setCitiesList(sorted);
        })
        .catch(() => toast.error("Erro ao carregar cidades"));
    } else {
      setCitiesList([]);
    }
  }, [currentState]);

  const onSubmit = async (data: CustomerFormData) => {
    setLoading(true);
    const token = getToken();

    const res = await fetch("/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || "Erro ao cadastrar cliente.");
    } else {
      toast.success("Cliente cadastrado com sucesso!");
      onClose();
      reset();
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input placeholder="Nome do cliente" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                placeholder="email@email.com"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="adress">Endereço</Label>
              <Input placeholder="Endereço" {...register("adress")} />
              {errors.adress && (
                <p className="text-xs text-red-500">{errors.adress.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <select
                {...register("state")}
                className="w-full rounded border px-3 py-2 text-sm text-muted-foreground"
              >
                <option value="">Selecione o estado</option>
                {statesList.map((uf) => (
                  <option key={uf.id} value={uf.sigla}>
                    {uf.nome}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-xs text-red-500">{errors.state.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <select
                {...register("city")}
                disabled={!currentState}
                className="w-full rounded border px-3 py-2 text-sm text-muted-foreground"
              >
                <option value="">Selecione a cidade</option>
                {citiesList.map((city) => (
                  <option key={city.id} value={city.nome}>
                    {city.nome}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <InputMask
                    mask="(99) 99999-9999"
                    value={field.value}
                    onChange={field.onChange}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        placeholder="Telefone"
                        type="text"
                      />
                    )}
                  </InputMask>
                )}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="personType">Tipo de Pessoa</Label>
              <RadioGroup
                value={personType}
                onValueChange={(value) =>
                  setPersonType(value as "fisica" | "juridica")
                }
                className="flex gap-4 py-2"
              >
                <RadioGroupItem value="fisica" id="fisica" />
                <Label htmlFor="fisica">Física</Label>
                <RadioGroupItem value="juridica" id="juridica" />
                <Label htmlFor="juridica">Jurídica</Label>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="cpf_cnpj">
                {personType === "juridica" ? "CNPJ" : "CPF"}
              </Label>
              <Controller
                control={control}
                name="cpf_cnpj"
                render={({ field }) => {
                  const mask =
                    personType === "juridica"
                      ? "99.999.999/9999-99"
                      : "999.999.999-99";
                  return (
                    <InputMask
                      mask={mask}
                      value={cpfCnpj}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCpfCnpj(value);
                        field.onChange(value);
                      }}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          placeholder={
                            personType === "juridica" ? "CNPJ" : "CPF"
                          }
                          type="text"
                        />
                      )}
                    </InputMask>
                  );
                }}
              />
              {errors.cpf_cnpj && (
                <p className="text-xs text-red-500">
                  {errors.cpf_cnpj.message}
                </p>
              )}
            </div>
          </div>

          <Button
            disabled={loading}
            type="submit"
            className="w-full bg-green text-white"
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCustomerModal;
