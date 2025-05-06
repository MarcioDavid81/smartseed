"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa";
import InputMask from "react-input-mask";

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StateUF {
  id: number;
  sigla: string;
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
      "CPF ou CNPJ inválido"
    ),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const NewCustomerModal = ({ isOpen, onClose }: NewCustomerModalProps) => {
  const [statesList, setStatesList] = useState<StateUF[]>([]);
  const [loading, setLoading] = useState(false);
  const [cpfCnpj, setCpfCnpj] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

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

  const onSubmit = async (data: CustomerFormData) => {
    setLoading(true);
    const token = localStorage.getItem("token");

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
          <Input placeholder="Nome do cliente" {...register("name")} />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}

          <Input
            placeholder="email@email.com"
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}

          <Input placeholder="Endereço" {...register("adress")} />
          {errors.adress && (
            <p className="text-red-500 text-xs">{errors.adress.message}</p>
          )}

          <Input placeholder="Cidade" {...register("city")} />
          {errors.city && (
            <p className="text-red-500 text-xs">{errors.city.message}</p>
          )}

          <select
            {...register("state")}
            className="border rounded px-3 py-2 text-sm text-muted-foreground w-full"
          >
            <option value="">Selecione o estado</option>
            {statesList.map((uf) => (
              <option key={uf.id} value={uf.sigla}>
                {uf.nome}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-500 text-xs">{errors.state.message}</p>
          )}

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
                  <Input {...inputProps} placeholder="Telefone" type="text" />
                )}
              </InputMask>
            )}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs">{errors.phone.message}</p>
          )}

          <Controller
            control={control}
            name="cpf_cnpj"
            render={({ field }) => {
              const numeric = cpfCnpj.replace(/\D/g, "");
              const mask =
                numeric.length < 15 ? "99.999.999/9999-99" : "999.999.999-99"; ;

              return (
                <InputMask
                  mask={mask}
                  value={cpfCnpj}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCpfCnpj(value);
                    field.onChange(value); // sincroniza com react-hook-form
                  }}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      placeholder="CPF ou CNPJ"
                      type="text"
                    />
                  )}
                </InputMask>
              );
            }}
          />
          {errors.cpf_cnpj && (
            <p className="text-red-500 text-xs">{errors.cpf_cnpj.message}</p>
          )}

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
