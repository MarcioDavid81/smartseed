import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { IndustryTransporter } from "@/types";
import { industryTransporterSchema, IndustryTransporterFormData } from "@/lib/schemas/industryTransporter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSmartToast } from "@/contexts/ToastContext";
import { useUpsertIndustryTransporter } from "@/queries/industry/use-upsert-industry-transporter";
import { ApiError } from "@/lib/http/api-error";
import InputMask from "react-input-mask";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAddress } from "@/queries/adress/use-adress";

interface UpsertIndustryTransporterModalProps {
  industryTransporter?: IndustryTransporter;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertIndustryTransporterModal = ({
  industryTransporter,
  isOpen,
  onClose,
}: UpsertIndustryTransporterModalProps) => {
  const [personType, setPersonType] = useState<"fisica" | "juridica">("fisica");
  const { showToast } = useSmartToast();

  const form = useForm<IndustryTransporterFormData>({
    resolver: zodResolver(industryTransporterSchema),
    defaultValues: {
      name: industryTransporter?.name ?? "",
      fantasyName: industryTransporter?.fantasyName ?? "",
      cpf_cnpj: industryTransporter?.cpf_cnpj ?? "",
      adress: industryTransporter?.adress ?? "",
      city: industryTransporter?.city ?? "",
      state: industryTransporter?.state ?? "",
      phone: industryTransporter?.phone ?? "",
      email: industryTransporter?.email ?? undefined,
    },
  });

  useEffect(() => {
    if (industryTransporter) {
      form.reset({
        name: industryTransporter.name,
        fantasyName: industryTransporter.fantasyName,
        cpf_cnpj: industryTransporter.cpf_cnpj,
        adress: industryTransporter.adress,
        city: industryTransporter.city,
        state: industryTransporter.state,
        phone: industryTransporter.phone,
        email: industryTransporter.email,
      });

      const onlyNumbers = industryTransporter.cpf_cnpj?.replace(/\D/g, "") || "";

      setPersonType(onlyNumbers.length === 14 ? "juridica" : "fisica");
    } else {
      form.reset();
      setPersonType("fisica");
    }
  }, [industryTransporter, isOpen, form]);

  const { states, cities, isLoadingCities } = useAddress({
    isOpen,
    form,
    stateField: "state",
    cityField: "city",
  });

  const { mutate, isPending } = useUpsertIndustryTransporter ({
    transporterId: industryTransporter?.id
  })

  const onSubmit = (data: IndustryTransporterFormData) => {
    mutate(data, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso",
          message: industryTransporter
          ? "Transportador atualizado com sucesso!"
          : "Transportador cadastrado com sucesso!"
        });
        onClose(),
        form.reset();
      },
      onError: (error: Error) => {
        if (error instanceof ApiError) {
          if (error.status === 402) {
            showToast({
              type: "info",
              title: "Limite atingido",
              message: error.message,
            });
            return;
          } 
            
          if (error.status === 401) {
            showToast({
              type: "info",
              title: "Sessão expirada",
              message: "Faça login novamente",
            });
            return;
          }
        }
        showToast({
          type: "error",
          title: "Erro",
          message: error.message || `Erro ao ${
            industryTransporter ? "atualizar" : "criar"
          } transportador.`,
        });
      },
    })
  }

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Transportadores</DialogTitle>
          <DialogDescription>
            {industryTransporter ? "Editar transportador" : "Cadastrar transportador"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Transportes Agro" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fantasyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Agro" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div>
              <FormItem>
                <FormLabel>Tipo de pessoa</FormLabel>
                <RadioGroup
                  value={personType}
                  onValueChange={(value) => {
                    setPersonType(value as "fisica" | "juridica");
                    form.setValue("cpf_cnpj", ""); // limpa ao trocar
                  }}
                  className="flex gap-4"
                >
                  <FormItem className="flex items-center gap-2">
                    <RadioGroupItem value="fisica" id="fisica" />
                    <FormLabel htmlFor="fisica">Pessoa Física</FormLabel>
                  </FormItem>

                  <FormItem className="flex items-center gap-2">
                    <RadioGroupItem value="juridica" id="juridica" />
                    <FormLabel htmlFor="juridica">Pessoa Jurídica</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormItem>
              </div>
              <div>
              <FormField
                control={form.control}
                name="cpf_cnpj"
                render={({ field }) => {
                  const isJuridica = personType === "juridica";

                  return (
                    <FormItem>
                      <FormLabel>{isJuridica ? "CNPJ" : "CPF"}</FormLabel>
                      <FormControl>
                        <InputMask
                          mask={
                            isJuridica
                              ? "99.999.999/9999-99"
                              : "999.999.999-99"
                          }
                          value={field.value}
                          onChange={field.onChange}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              placeholder={isJuridica ? "CNPJ" : "CPF"}
                              type="text"
                            />
                          )}
                        </InputMask>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
              <FormField
                control={form.control}
                name="adress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Rua A, 123" />
                    </FormControl>
                  </FormItem>
                )}
              />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Select
                        value={form.watch("state")}
                        onValueChange={(value) => form.setValue("state", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.id} value={state.sigla}>
                              {state.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Select
                        value={form.watch("city")}
                        onValueChange={(value) => form.setValue("city", value)}
                        disabled={!form.watch("state") || isLoadingCities}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.nome}>
                              {city.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
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
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: contato@exemplo.com" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full bg-green text-white"
            >
              {isPending ? <FaSpinner className="animate-spin" /> : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertIndustryTransporterModal;
