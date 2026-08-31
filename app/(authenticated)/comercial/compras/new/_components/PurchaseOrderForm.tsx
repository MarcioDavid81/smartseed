"use client";

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
import { Card, CardContent } from "@/components/ui/card";
import { useSmartToast } from "@/contexts/ToastContext";
import {
  purchaseOrderSchema,
  PurchaseOrderFormData,
} from "@/lib/schemas/purchaseOrderSchema";
import { PurchaseOrderDetails, PurchaseOrderFormInitialData } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PurchaseOrderType, Unit } from "@prisma/client";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUpsertPurchaseOrder } from "@/queries/commercial/use-purchase-orders";
import { ComboBoxOption } from "@/components/combo-option";
import { useCustomers } from "@/queries/registrations/use-customer";
import { useMembers } from "@/queries/registrations/use-member";
import PurchaseOrderItemForm from "../../_components/PurchaseOrderItemForm";

interface PurchaseOrderFormProps {
  compra?: PurchaseOrderFormInitialData;
}

const PurchaseOrderForm = ({ compra }: PurchaseOrderFormProps) => {
  const { showToast } = useSmartToast();
  const router = useRouter();

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
  const selectedMember = members.find((m) => m.id === memberId);
  const addresses = selectedMember?.adresses ?? [];

  useEffect(() => {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compra]);

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
        router.push("/comercial/compras");
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 pb-24" // pb-24 dá espaço pro footer fixo
      >
        {/* ---------- Dados gerais ---------- */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sócio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um sócio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
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
                          <SelectValue
                            placeholder={
                              memberId
                                ? "Selecione uma inscrição estadual"
                                : "Selecione um sócio primeiro"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {addresses.map((memberAdress) => (
                          <SelectItem key={memberAdress.id} value={memberAdress.id}>
                            <div className="flex items-center justify-between gap-2">
                              <span>{memberAdress.stateRegistration}</span>
                              <span className="text-muted-foreground">
                                {memberAdress.district}, {memberAdress.city} -{" "}
                                {memberAdress.state}
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
          </CardContent>
        </Card>

        {/* ---------- Itens ---------- */}
        <Card>
          <CardContent className="pt-6 space-y-4">
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

            {/* sem ScrollArea com altura fixa: a página inteira rola */}
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

              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum item adicionado ainda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ---------- Footer fixo ---------- */}
        <div className="fixed bottom-0 left-0 right-0 bg-background p-4 flex justify-end gap-2 md:pl-[var(--sidebar-width,0px)]">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} className="bg-green text-white min-w-[120px]">
            {isPending ? <FaSpinner className="animate-spin" /> : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PurchaseOrderForm;