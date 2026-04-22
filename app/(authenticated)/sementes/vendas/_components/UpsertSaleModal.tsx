"use client";

import { ComboBoxOption } from "@/components/combo-option";
import { MoneyInput, QuantityInput } from "@/components/inputs";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSmartToast } from "@/contexts/ToastContext";
import { getCycle } from "@/lib/cycle";
import { ApiError } from "@/lib/http/api-error";
import { SeedSaleFormData, seedSaleSchema } from "@/lib/schemas/seedSaleSchema";
import { useCustomers } from "@/queries/registrations/use-customer";
import { useMembers } from "@/queries/registrations/use-member";
import { useSeedCultivarAvailableForSaleQuery } from "@/queries/seed/use-seed-cultivar-query";
import { useUpsertSeedSale } from "@/queries/seed/use-upsert-seed-sale";
import { Sale } from "@/types/sale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PaymentCondition } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

interface UpsertSaleModalProps {
  venda?: Sale;
  isOpen: boolean;
  onClose: () => void;

  /** 🆕 contexto de atendimento */
  saleContractItemId?: string;
  cultivarId?: string;
  customerId?: string;
  customerName?: string;
  memberId?: string;
  memberName?: string;
  memberAdressId?: string;
  saleValue?: number;
  maxQuantityKg?: number;
  initialQuantityKg?: number;
}

const UpsertSaleModal = ({
  venda,
  isOpen,
  onClose,
  saleContractItemId,
  cultivarId,
  customerId,
  customerName,
  memberId,
  memberName,
  memberAdressId,
  saleValue,
  maxQuantityKg,
  initialQuantityKg,
}: UpsertSaleModalProps) => {
  const { showToast } = useSmartToast();
  const router = useRouter();
  const cycle = getCycle();

  const suggestedQuantityKg = initialQuantityKg ?? maxQuantityKg ?? undefined;
  const customerPlaceholder = customerName || "Selecione um cliente";
  const socioPlaceholder = memberName || "Selecione um sócio";
  const socioAdressPlaceholder = memberAdressId || "Primeiro selecione um sócio";

  const form = useForm<SeedSaleFormData>({
    resolver: zodResolver(seedSaleSchema),
    defaultValues: {
      cultivarId: venda?.cultivarId ?? cultivarId ?? "",
      customerId: venda?.customerId ?? customerId ?? "",
      memberId: venda?.memberId ?? memberId ?? "",
      memberAdressId: venda?.memberAdressId ?? memberAdressId ?? "",
      date: venda ? new Date(venda.date) : new Date(),
      invoiceNumber: venda?.invoiceNumber ?? "",
      saleValue: venda?.saleValue ?? 0,
      quantityKg: venda?.quantityKg ?? 0,
      notes: venda?.notes ?? "",
      paymentCondition: venda?.paymentCondition ?? PaymentCondition.AVISTA,
      dueDate: venda?.dueDate ? new Date(venda.dueDate) : new Date(),
      saleContractItemId: saleContractItemId ?? undefined,
    },
  });

  useEffect(() => {
    if (venda) {
      form.reset({
        cultivarId: venda.cultivarId,
        customerId: venda.customerId,
        memberId: venda.memberId ?? "",
        memberAdressId: venda.memberAdressId ?? "",
        date: venda ? new Date(venda.date) : new Date(),
        invoiceNumber: venda.invoiceNumber,
        saleValue: venda.saleValue,
        quantityKg: venda.quantityKg,
        notes: venda.notes || "",
        paymentCondition: venda.paymentCondition ?? PaymentCondition.AVISTA,
        dueDate: venda?.dueDate ? new Date(venda.dueDate) : new Date(),
        saleContractItemId: saleContractItemId ?? undefined,
      });
    } else {
      form.reset({
        date: new Date(),
        saleContractItemId: saleContractItemId ?? undefined,
        cultivarId: cultivarId ?? "",
        customerId: customerId ?? "",
        memberId: memberId ?? "",
        memberAdressId: memberAdressId ?? "",
        saleValue: saleValue ?? 0,
        quantityKg: suggestedQuantityKg ?? 0,
      });
    }
  }, [
    venda,
    isOpen,
    saleContractItemId,
    cultivarId,
    customerId,
    memberId,
    memberAdressId,
    saleValue,
    isOpen,
    suggestedQuantityKg,
    form
  ]);
  
  const { data: cultivars = [] } = useSeedCultivarAvailableForSaleQuery();
  const { data: customers = [] } = useCustomers();
  const { data: members = [] } = useMembers();
  const socioId = form.watch("memberId");
  const selectedMember = members.find(m => m.id === socioId);
  const addresses = selectedMember?.adresses ?? [];

  const { mutate, isPending } = useUpsertSeedSale({
    cycleId: cycle?.id!,
    saleId: venda?.id,
    saleContractItemId: saleContractItemId ?? undefined,
  });

  const onSubmit = async (data: SeedSaleFormData) => {
    if (!cycle?.id) {
      showToast({
        type: "error",
        title: "Erro",
        message: "Nenhum ciclo de produção selecionado.",
      });
      return;
    }

    if (
      saleContractItemId &&
      maxQuantityKg &&
      data.quantityKg > maxQuantityKg
    ) {
      showToast({
        type: "error",
        title: "Quantidade inválida",
        message: "A quantidade excede o saldo disponível do pedido.",
      });
      return;
    }

    mutate(
      {
        ...data,
        saleContractItemId: saleContractItemId ?? undefined,
      },
      {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso",
          message: venda
            ? "Venda atualizada com sucesso!"
            : "Venda cadastrada com sucesso!",
        });
          
        onClose();
        form.reset();
        router.refresh();
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
        message: error.message,
      });
    },
    });
  };

  useEffect(() => {
    if (cultivarId) {
      form.setValue("cultivarId", cultivarId, { shouldValidate: true });
    }

    if (customerId) {
      form.setValue("customerId", customerId, { shouldValidate: true });
    }

    if (memberId) {
      form.setValue("memberId", memberId, { shouldValidate: true });
    }

    if (memberAdressId) {
      form.setValue("memberAdressId", memberAdressId, { shouldValidate: true });
    }

    if (typeof saleValue === "number") {
      form.setValue("saleValue", saleValue, {
        shouldValidate: true,
      });
    }

    if (typeof suggestedQuantityKg === "number") {
      form.setValue("quantityKg", suggestedQuantityKg, {
        shouldValidate: true,
      });
    }
  }, [cultivarId, customerId, memberId, memberAdressId, saleValue, suggestedQuantityKg, form])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Venda
            {saleContractItemId && (
              <span className="text-xs bg-green/10 text-green px-2 py-1 rounded">
                Atendimento de Contrato
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {venda ? "Editar venda" : "Cadastrar venda"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              {/* Data e Nota Fiscal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <DatePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nota Fiscal</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sócio e Inscrição Estadual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel> Sócio</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!saleContractItemId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={socioPlaceholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              <div className="flex justify-between gap-2">
                                <span>{member.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memberAdressId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inscrição Estadual</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!saleContractItemId || !socioId || addresses.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              socioId ? "Selecione uma inscrição" : socioAdressPlaceholder
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {addresses.map((memberAdress) => (
                            <SelectItem key={memberAdress.id} value={memberAdress.id}>
                              <div className="flex justify-between gap-2">
                                <span>{memberAdress.stateRegistration}</span>
                                <span className="text-muted-foreground">
                                  {memberAdress.district}, {memberAdress.city} - {memberAdress.state}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cultivar e Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cultivarId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cultivar</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!!saleContractItemId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cultivar" />
                          </SelectTrigger>
                          <SelectContent>
                            {cultivars.map((cultivar) => (
                              <SelectItem key={cultivar.id} value={cultivar.id}>
                                <div className="flex items-center gap-2">
                                  <span>{cultivar.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {`Estoque: ${cultivar.stock} kg`}
                                  </span>
                                </div>
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
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destino</FormLabel>
                      <FormControl>
                        <ComboBoxOption
                          options={customers.map((c) => ({
                            label: c.name,
                            value: c.id,
                          }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={customerPlaceholder}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quantidade e Valor Total */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantityKg"
                  render={({ field }) => (
                    <QuantityInput label="Quantidade (kg)" field={field} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="saleValue"
                  render={({ field }) => (
                    <MoneyInput label="Valor Total" field={field} />
                  )}
                />
              </div>

              {/* Preço Total e Condição de Pagamento (FormField + condicional APRAZO) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição de Pagamento</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ?? PaymentCondition.AVISTA}
                          onValueChange={(v) => field.onChange(v as PaymentCondition)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a condição" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PaymentCondition.AVISTA}>À Vista</SelectItem>
                            <SelectItem value={PaymentCondition.APRAZO}>À Prazo</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.getValues("paymentCondition") === PaymentCondition.APRAZO && (
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Vencimento</FormLabel>
                        <FormControl>
                          <DatePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Observações */}
              <div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Opcional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-green text-white mt-4"
              >
                {isPending ? <FaSpinner className="animate-spin" /> : "Salvar"}
              </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertSaleModal;
