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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSmartToast } from "@/contexts/ToastContext";
import {
  purchaseOrderSchema,
  PurchaseOrderFormData,
} from "@/lib/schemas/purchaseOrderSchema";
import { PurchaseOrderDetails } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PurchaseOrderType, Unit } from "@prisma/client";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { useUpsertPurchaseOrder } from "@/queries/commercial/use-purchase-orders";
import PurchaseOrderItemForm from "./PurchaseOrderItemForm";
import { ComboBoxOption } from "@/components/combo-option";
import { useCustomers } from "@/queries/registrations/use-customer";
import { useMembers } from "@/queries/registrations/use-member";

interface UpsertPurchaseOrderModalProps {
  compra?: PurchaseOrderDetails;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertPurchaseOrderModal = ({
  isOpen,
  onClose,
  compra,
}: UpsertPurchaseOrderModalProps) => {
  const { showToast } = useSmartToast();

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      type: compra?.type || PurchaseOrderType.INPUT_PURCHASE,
      date: compra ? new Date(compra.date) : new Date(),
      customerId: compra?.customerId || "",
      memberId: compra?.memberId || "",
      memberAdressId: compra?.memberAdressId || "",
      document: compra?.document || "",
      notes: compra?.notes || "",
      items:
        compra?.items.map((item) => ({
          id: item.id,
          productId: item.productId ?? undefined,
          cultivarId: item.cultivarId ?? undefined,
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
  const { data: members = [] } = useMembers();
  const memberId = form.watch("memberId");
  const selectedMember = members.find(m => m.id === memberId);
  const addresses = selectedMember?.adresses ?? [];

  useEffect(() => {
    if (!isOpen) return;

    if (compra) {
      form.reset({
        type: compra.type,
        date: new Date(compra.date),
        customerId: compra.customerId,
        memberId: compra.memberId || "",
        memberAdressId: compra.memberAdressId || "",
        document: compra.document ?? "",
        notes: compra.notes ?? "",
        items: compra.items.map((item) => ({
          id: item.id,
          productId: item.productId ?? undefined,
          cultivarId: item.cultivarId ?? undefined,
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
  }, [isOpen, compra, form]);

  const { mutate, isPending } = useUpsertPurchaseOrder({
    purchaseOrderId: compra?.id,
  });

  const onSubmit = (data: PurchaseOrderFormData) => {
    mutate(data, {
      onSuccess: () => {
        showToast({
          type: "success",
          title: "Sucesso",
          message: compra
            ? "Pedido de compra atualizado com sucesso!"
            : "Pedido de compra cadastrado com sucesso!",
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
      <DialogContent className="sm:max-w-[900px] max-h-[95vh] md:max-h-full overflow-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Pedido de Compra</DialogTitle>
          <DialogDescription>
            {compra ? "Editar pedido de compra" : "Novo pedido de compra"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2" >
            {/* Data e Documento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma sócio" />
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
                        disabled={!memberId || addresses.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                              memberId ? "Selecione uma inscrição estadual" : "Selecione uma sócio primeiro"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {addresses.map((memberAdress) => (
                            <SelectItem key={memberAdress.id} value={memberAdress.id}>
                              <div className="flex items-center justify-between gap-2">
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

              {/* Tipo e Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <SelectItem value={PurchaseOrderType.INPUT_PURCHASE}>
                              Compra de Insumos
                            </SelectItem>
                            <SelectItem value={PurchaseOrderType.SEED_PURCHASE}>
                              Compra de Sementes
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

              {/* Observações */}
              <div>
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
              </div>

            {/* ---------- Itens (SCROLL) ---------- */}
            <div className="flex flex-col gap-2 flex-1">
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

              <ScrollArea className="h-[250px]">
                <div className="space-y-4">
                  {fields.map((_, index) => (
                    <PurchaseOrderItemForm
                      key={index}
                      form={form}
                      index={index}
                      onRemove={() => remove(index)}
                      orderType={orderType}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* ---------- Footer ---------- */}
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

export default UpsertPurchaseOrderModal;
