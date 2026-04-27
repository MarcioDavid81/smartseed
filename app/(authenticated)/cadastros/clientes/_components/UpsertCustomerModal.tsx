"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { Customer } from "@/types";
import { useSmartToast } from "@/contexts/ToastContext";
import {
  CustomerFormData,
  customerSchema,
} from "@/lib/schemas/customerSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InputMask from "react-input-mask";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAddress } from "@/queries/adress/use-adress";
import { useCreateCustomerWithTransporter } from "@/queries/registrations/use-create-customer-with-transporter";
import { useUpsertCustomer } from "@/queries/registrations/use-customer";

interface UpsertCustomerModalProps {
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertCustomerModal = ({
  customer,
  isOpen,
  onClose,
}: UpsertCustomerModalProps) => {
  const [personType, setPersonType] = useState<"fisica" | "juridica">("fisica");
  const [alsoTransporter, setAlsoTransporter] = useState(false);

  const { showToast } = useSmartToast();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name ?? "",
      fantasyName: customer?.fantasyName ?? "",
      cpf_cnpj: customer?.cpf_cnpj ?? "",
      adress: customer?.adress ?? "",
      city: customer?.city ?? "",
      state: customer?.state ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
    },
  });

  // 🔄 Reset / controle edição
  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        fantasyName: customer.fantasyName,
        cpf_cnpj: customer.cpf_cnpj,
        adress: customer.adress,
        city: customer.city,
        state: customer.state,
        phone: customer.phone,
        email: customer.email,
      });

      const onlyNumbers = customer.cpf_cnpj?.replace(/\D/g, "") || "";
      setPersonType(onlyNumbers.length === 14 ? "juridica" : "fisica");

      setAlsoTransporter(false);
    } else {
      form.reset();
      setPersonType("fisica");
      setAlsoTransporter(false);
    }
  }, [customer, isOpen, form]);

  const { states, cities, isLoadingCities } = useAddress({
    isOpen,
    form,
    stateField: "state",
    cityField: "city",
  });

  // 🔥 Novo fluxo
  const {
    createCustomerWithTransporter,
    isLoading: isCreatingWithTransporter,
  } = useCreateCustomerWithTransporter();

  // 🔁 Fluxo antigo (edição)
  const { mutate: upsertCustomer, isPending: isUpdating } = useUpsertCustomer({
    customerId: customer?.id,
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (customer) {
        // 🔁 Edição
        upsertCustomer(data, {
          onSuccess: () => {
            showToast({
              type: "success",
              title: "Sucesso!",
              message: "Cliente atualizado com sucesso!",
            });
            onClose();
          },
          onError: (error) => {
            showToast({
              type: "error",
              title: "Erro",
              message:
                error.message ||
                "Erro ao atualizar cliente. Tente novamente.",
            });
          },
        });

        return;
      }

      // 🚀 Criação
      await createCustomerWithTransporter({
        customer: data,
        alsoTransporter,
      });

      showToast({
        type: "success",
        title: "Sucesso!",
        message: alsoTransporter
          ? "Cliente e transportador cadastrados com sucesso!"
          : "Cliente cadastrado com sucesso!",
      });

      onClose();
      form.reset();
      setAlsoTransporter(false);
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Erro",
        message:
          error.message ||
          "Ocorreu um erro ao salvar. Por favor, tente novamente.",
      });
    }
  };

  const isLoading = isCreatingWithTransporter || isUpdating;

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Clientes</DialogTitle>
          <DialogDescription>
            {customer ? "Editar cliente" : "Cadastrar cliente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">

              {/* 🔥 RADIO NOVO */}
              {!customer && (
                <FormItem>
                  <FormLabel>Tipo de cadastro</FormLabel>
                  <RadioGroup
                    value={alsoTransporter ? "both" : "customer"}
                    onValueChange={(value) =>
                      setAlsoTransporter(value === "both")
                    }
                    className="flex gap-6"
                  >
                    <FormItem className="flex items-center gap-2">
                      <RadioGroupItem value="customer" id="customer" />
                      <FormLabel htmlFor="customer">
                        Apenas cliente
                      </FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center gap-2">
                      <RadioGroupItem value="both" id="both" />
                      <FormLabel htmlFor="both">
                        Cliente e transportador
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormItem>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Agro Campo LTDA" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fantasyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Agro Campo" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel>Tipo de pessoa *</FormLabel>
                <RadioGroup
                  value={personType}
                  onValueChange={(value) => {
                    setPersonType(value as "fisica" | "juridica");
                    form.setValue("cpf_cnpj", "");
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
                          {(inputProps: any) => <Input {...inputProps} />}
                        </InputMask>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

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
                  render={() => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Select
                          value={form.watch("state")}
                          onValueChange={(value) =>
                            form.setValue("state", value)
                          }
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
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={() => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Select
                          value={form.watch("city")}
                          onValueChange={(value) =>
                            form.setValue("city", value)
                          }
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
                          {(inputProps: any) => <Input {...inputProps} />}
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
                        <Input {...field} placeholder="email@exemplo.com" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-green text-white"
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertCustomerModal;