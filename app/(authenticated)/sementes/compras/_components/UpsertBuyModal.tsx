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
import { Buy } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { PaymentCondition } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BuyFormData, seedBuySchema } from "@/lib/schemas/seedBuyScheema";
import { useSmartToast } from "@/contexts/ToastContext";
import { useUpsertSeedBuy } from "@/queries/seed/use-upsert-seed-buy";
import { ApiError } from "@/lib/http/api-error";
import { DatePicker } from "@/components/ui/date-picker";
import { MoneyInput, QuantityInput } from "@/components/inputs";
import { useCustomers } from "@/queries/registrations/use-customer";
import { useSeedCultivarQuery } from "@/queries/seed/use-seed-cultivar-query";
import { getCycle } from "@/lib/cycle";

interface UpsertBuyModalProps {
  compra?: Buy;
  isOpen: boolean;
  onClose: () => void;

  /** 🆕 contexto de atendimento */
  purchaseOrderItemId?: string;
  cultivarId?: string;
  customerId?: string;
  customerName?: string;
  unityPrice?: number;
  maxQuantityKg?: number;
  initialQuantityKg?: number;
}

const UpsertBuyModal = ({
  compra,
  isOpen,
  onClose,
  purchaseOrderItemId,
  cultivarId,
  customerId,
  customerName,
  unityPrice: unityPriceFromOrder,
  maxQuantityKg,
  initialQuantityKg,
}: UpsertBuyModalProps) => {
  const { showToast } = useSmartToast();
  const cycle = getCycle();

  const suggestedQuantityKg =
    initialQuantityKg ?? maxQuantityKg ?? undefined;

  const customerPlaceholder = customerName ?? "Selecione um fornecedor";

  const form = useForm<BuyFormData>({
    resolver: zodResolver(seedBuySchema),
    defaultValues: {
      cultivarId: compra?.cultivarId ?? cultivarId ?? "",
      customerId: compra?.customerId ?? customerId ?? "",
      date: compra ? new Date(compra.date) : new Date(),
      invoice: compra?.invoice ?? "",
      unityPrice: compra?.unityPrice ?? unityPriceFromOrder ?? 0,
      totalPrice: compra?.totalPrice ?? 0,
      quantityKg: compra?.quantityKg ?? suggestedQuantityKg ?? 0,
      notes: compra?.notes ?? "",
      paymentCondition: compra?.paymentCondition ?? PaymentCondition.AVISTA,
      dueDate: compra?.dueDate ? new Date(compra.dueDate) : new Date(),
      purchaseOrderItemId: purchaseOrderItemId ?? undefined,
    },
  });

  const unityPrice = Number(form.watch("unityPrice") ?? 0);
  const quantityKg = Number(form.watch("quantityKg") ?? 0);
  const paymentCondition = form.watch("paymentCondition");

  useEffect(() => {
    const total = unityPrice * quantityKg;
    form.setValue(
      "totalPrice",
      Number.isFinite(total) ? Number(total.toFixed(2)) : 0
    );
  }, [unityPrice, quantityKg, form]);

  useEffect(() => {
    if (compra) {
      form.reset({
        cultivarId: compra.cultivarId,
        customerId: compra.customerId,
        date: new Date(compra.date),
        invoice: compra.invoice,
        unityPrice: compra.unityPrice,
        totalPrice: compra.totalPrice,
        quantityKg: compra.quantityKg,
        notes: compra.notes || "",
        paymentCondition: compra.paymentCondition ?? PaymentCondition.AVISTA,
        dueDate: compra.dueDate ? new Date(compra.dueDate) : new Date(),
        purchaseOrderItemId: purchaseOrderItemId ?? undefined,
      });
    } else {
      form.reset({
        date: new Date(),
        purchaseOrderItemId: purchaseOrderItemId ?? undefined,
        cultivarId: cultivarId ?? "",
        customerId: customerId ?? "",
        unityPrice: unityPriceFromOrder ?? 0,
        quantityKg: suggestedQuantityKg ?? 0,
      });
    }
  }, [
    compra,
    isOpen,
    purchaseOrderItemId,
    cultivarId,
    customerId,
    unityPriceFromOrder,
    suggestedQuantityKg,
    form,
  ]);

  const { data: cultivars = [] } = useSeedCultivarQuery();
  const { data: customers = [] } = useCustomers();

  const { mutate, isPending } = useUpsertSeedBuy({
    cycleId: cycle?.id!,
    buyId: compra?.id,
    purchaseOrderItemId: purchaseOrderItemId ?? undefined,
  });

  const onSubmit = (data: BuyFormData) => {
    if (!cycle?.id) {
      showToast({
        type: "error",
        title: "Erro",
        message: "Nenhum ciclo de produção selecionado.",
      });
      return;
    }

    if (
      purchaseOrderItemId &&
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
        purchaseOrderItemId: purchaseOrderItemId ?? undefined,
      },
      {
        onSuccess: () => {
          showToast({
            type: "success",
            title: "Sucesso",
            message: compra
              ? "Compra atualizada com sucesso!"
              : "Compra cadastrada com sucesso!",
          });

          onClose();
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
                message: "Faça login novamente.",
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
      }
    );
  };

  useEffect(() => {
    if (cultivarId) {
      form.setValue("cultivarId", cultivarId, { shouldValidate: true });
    }

    if (customerId) {
      form.setValue("customerId", customerId, { shouldValidate: true });
    }

    if (typeof unityPriceFromOrder === "number") {
      form.setValue("unityPrice", unityPriceFromOrder, {
        shouldValidate: true,
      });
    }

    if (typeof suggestedQuantityKg === "number") {
      form.setValue("quantityKg", suggestedQuantityKg, {
        shouldValidate: true,
      });
    }
  }, [cultivarId, customerId, unityPriceFromOrder, suggestedQuantityKg, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Compra
            {purchaseOrderItemId && (
              <span className="text-xs bg-green/10 text-green px-2 py-1 rounded">
                Atendimento de Pedido
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {compra ? "Editar compra" : "Cadastrar compra"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cultivarId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cultivar</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!purchaseOrderItemId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cultivar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cultivars.map((cultivar) => (
                          <SelectItem key={cultivar.id} value={cultivar.id}>
                            <div className="flex justify-between gap-2">
                              <span>{cultivar.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Estoque: {cultivar.stock} kg
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

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!purchaseOrderItemId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={customerPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div className="flex justify-between gap-2">
                              <span>{customer.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {customer.cpf_cnpj}
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
                name="invoice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nota Fiscal</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantityKg"
                render={({ field }) => (
                  <QuantityInput
                    label="Quantidade"
                    field={field}
                    max={maxQuantityKg}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="unityPrice"
                render={({ field }) => (
                  <MoneyInput 
                    label="Preço Unitário" 
                    field={field} 
                    readonly={!!purchaseOrderItemId} 
                  />
                )}
              />

              <FormField
                control={form.control}
                name="totalPrice"
                render={({ field }) => (
                  <MoneyInput label="Preço Total" field={field} readonly />
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condição de Pagamento</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a condição"/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={PaymentCondition.AVISTA}>
                            À Vista
                          </SelectItem>
                          <SelectItem value={PaymentCondition.APRAZO}>
                            À Prazo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {paymentCondition === PaymentCondition.APRAZO && (
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Vencimento</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

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

            <Button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full bg-green text-white hover:bg-green/90"
            >
              {isPending ? <FaSpinner className="animate-spin" /> : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertBuyModal;
