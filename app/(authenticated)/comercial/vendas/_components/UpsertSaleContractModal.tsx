"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSmartToast } from "@/contexts/ToastContext";
import {
  purchaseOrderSchema,
  PurchaseOrderFormData,
} from "@/lib/schemas/purchaseOrderSchema";
import { Customer, PurchaseOrder, SaleContract } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PurchaseOrderType, SaleContractType, Unit } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { useUpsertPurchaseOrder } from "@/queries/commercial/use-purchase-orders";
import SaleContractItemForm from "./SaleContractItemForm";
import { getCustomers } from "@/services/registrations/customer";
import { ComboBoxOption } from "@/components/combo-option";
import { useCustomers } from "@/queries/registrations/use-customer";
import { SaleContractFormData, saleContractSchema } from "@/lib/schemas/saleContractSchema";
import { useUpsertSaleContract } from "@/queries/commercial/use-sale-contracts";

interface UpsertSaleContractModalProps {
  venda?: SaleContract;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertSaleContractModal = ({
  isOpen,
  onClose,
  venda,
}: UpsertSaleContractModalProps) => {
  const { showToast } = useSmartToast();

  const form = useForm<SaleContractFormData>({
    resolver: zodResolver(saleContractSchema),
    defaultValues: {
      type: venda?.type || SaleContractType.INDUSTRY_SALE,
      date: venda ? new Date(venda.date) : new Date(),
      customerId: venda?.customerId || "",
      document: venda?.document || "",
      notes: venda?.notes || "",   
      items: venda?.items.map((item) => ({
        productId: item.product ?? undefined,
        cultivarId: item.cultivar?.id ?? undefined,
        description: item.description ?? "",
        quantity: Number(item.quantity),
        unit: item.unit,
        unityPrice: Number(item.unityPrice),
        totalPrice: Number(item.totalPrice),
      })) || [],      
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const orderType = form.watch("type");

  const { data: customers = [] } = useCustomers();

  useEffect(() => {
    if (!isOpen) return;

    if (venda) {
      form.reset({
        type: venda.type,
        date: new Date(venda.date),
        customerId: venda.customerId,
        document: venda.document ?? "",
        notes: venda.notes ?? "",
        items: venda.items.map((item) => ({
          productId: item.product ?? undefined,
          cultivarId: item.cultivar?.id ?? undefined,
          description: item.description ?? "",
          quantity: Number(item.quantity),
          unit: item.unit,
          unityPrice: Number(item.unityPrice),
          totalPrice: Number(item.totalPrice),
        })),
      });
    } else {
      form.reset();
    }
  }, [isOpen, venda, form]);

  const { mutate, isPending } = useUpsertSaleContract({
    saleContractId: venda?.id,
  });
  
  const onSubmit = (data: SaleContractFormData) => {
    console.log(data)
    mutate(data, {
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
      },
      onError: (error) => {
        showToast({
          type: "error",
          title: "Erro",
          message: error.message,
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Contrato de Venda</DialogTitle>
          <DialogDescription>
            {venda ? "Editar venda" : "Nova venda"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ---------- Cabeçalho ---------- */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tipo do pedido */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo do pedido</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={fields.length > 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SaleContractType.INDUSTRY_SALE}>
                            Venda de Grão
                          </SelectItem>
                          <SelectItem value={SaleContractType.SEED_SALE}>
                            Venda de Sementes
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <ComboBoxOption
                        value={field.value}
                        onChange={field.onChange}
                        options={customers.map((customer) => ({
                          label: customer.name,
                          value: customer.id,
                        }))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* ---------- Itens ---------- */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Itens</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      quantity: 0,
                      unit: Unit.KG,
                      unityPrice: 0,
                      totalPrice: 0,
                    })
                  }
                >
                  + Adicionar item
                </Button>
              </div>

              {fields.map((_, index) => (
                <SaleContractItemForm
                  key={index}
                  form={form}
                  index={index}
                  onRemove={() => remove(index)}
                  orderType={orderType}
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-green text-white"
            >
              {isPending ? <FaSpinner className="animate-spin" /> : "Salvar"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertSaleContractModal;
