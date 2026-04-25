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
import { Purchase } from "@/types/purchase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { PaymentCondition } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { MoneyInput, QuantityInput } from "@/components/inputs";
import { InputPurchaseFormData, inputPurchaseSchema } from "@/lib/schemas/inputSchema";
import { useUpsertInputPurchase } from "@/queries/input/use-input-purchase";
import { useSmartToast } from "@/contexts/ToastContext";
import { ApiError } from "@/lib/http/api-error";
import { useFarms } from "@/queries/registrations/use-farm";
import { useInputProductQuery } from "@/queries/input/use-input";
import { useCustomers } from "@/queries/registrations/use-customer";
import { PRODUCT_CLASS_OPTIONS } from "@/app/(authenticated)/_constants/insumos";
import { useMembers } from "@/queries/registrations/use-member";

interface UpsertPurchaseModalProps {
  compra?: Purchase;
  isOpen: boolean;
  onClose: () => void;

  /** 🆕 contexto de atendimento */
  purchaseOrderItemId?: string;
  productId?: string;
  customerId?: string;
  customerName?: string;
  memberId?: string;
  memberName?: string;
  memberAdressId?: string;
  unitPrice?: number;
  maxQuantityKg?: number;
  initialQuantity?: number;
}

const UpsertPurchaseModal = ({
  compra,
  isOpen,
  onClose,
  purchaseOrderItemId,
  productId,
  customerId,
  customerName,
  memberId,
  memberName,
  memberAdressId,
  unitPrice: unitPriceFromOrder,
  maxQuantityKg,
  initialQuantity,
}: UpsertPurchaseModalProps) => {
  const { showToast } = useSmartToast();
  const router = useRouter();

  const suggestedQuantity = initialQuantity ?? maxQuantityKg ?? undefined;
  const customerPlaceholder = customerName || "Selecione um fornecedor";
  const socioPlaceholder = memberName || "Selecione um sócio";
  const socioAdressPlaceholder = memberAdressId || "Selecione uma endereço";

  const form = useForm<InputPurchaseFormData>({
    resolver: zodResolver(inputPurchaseSchema),
    defaultValues: {
      date: compra?.date ? new Date(compra.date) : new Date(),
      customerId: compra?.customerId ?? customerId ?? "",
      memberId: compra?.memberId ?? memberId ?? "",
      memberAdressId: compra?.memberAdressId ?? memberAdressId ?? "",
      productId: compra?.productId ?? productId ?? "",
      invoiceNumber: compra?.invoiceNumber ?? "",
      quantity: compra?.quantity ?? suggestedQuantity ?? 0,
      unitPrice: compra?.unitPrice ?? unitPriceFromOrder ?? 0,
      totalPrice: compra?.totalPrice ?? 0,
      farmId: compra?.farmId ?? "",
      notes: compra?.notes ?? "",
      paymentCondition: compra?.paymentCondition ?? PaymentCondition.AVISTA,
      dueDate: compra?.dueDate ? new Date(compra.dueDate) : undefined,
      purchaseOrderItemId: purchaseOrderItemId ?? undefined,
    },
  });

  const unitPrice = form.watch("unitPrice");
  const quantity = form.watch("quantity");
  const paymentCondition = form.watch("paymentCondition");

  useEffect(() => {
    const total = unitPrice * quantity;
    form.setValue(
      "totalPrice",
      Number.isFinite(total) ? parseFloat(total.toFixed(2)) : 0
    );
  }, [unitPrice, quantity]);

  useEffect(() => {
    if (compra) {
      form.reset({
        date: compra?.date ? new Date(compra.date) : new Date(),
        customerId: compra.customerId,
        memberId: compra.memberId ?? "",
        memberAdressId: compra.memberAdressId ?? "",
        productId: compra.productId,
        invoiceNumber: compra.invoiceNumber,
        quantity: compra.quantity,
        unitPrice: compra.unitPrice,
        totalPrice: compra.totalPrice,
        farmId: compra.farmId,
        notes: compra.notes || "",
        paymentCondition: compra.paymentCondition ?? PaymentCondition.AVISTA,
        dueDate: compra?.dueDate ? new Date(compra.dueDate) : undefined,
        purchaseOrderItemId: purchaseOrderItemId ?? undefined,
      });
    } else {
      form.reset({
        date: new Date(),
        purchaseOrderItemId: purchaseOrderItemId ?? undefined,
        productId: productId ?? "",
        customerId: customerId ?? "",
        memberId: memberId ?? "",
        memberAdressId: memberAdressId ?? "",
        unitPrice: unitPriceFromOrder ?? 0,
        quantity: suggestedQuantity ?? 0,
      });
    }
  }, [
    compra,
    isOpen,
    purchaseOrderItemId,
    productId,
    customerId,
    memberId,
    memberAdressId,
    unitPriceFromOrder,
    suggestedQuantity,
    form,
  ]);

  const { data: farms = [] } = useFarms();
  const { data: products = [] } = useInputProductQuery();
  const { data: customers = [] } = useCustomers();
  const { data: members = [] } = useMembers();
  const socioId = form.watch("memberId");
  const selectedMember = members.find(m => m.id === socioId);
  const addresses = selectedMember?.adresses ?? [];

  const { mutate, isPending } = useUpsertInputPurchase({
    purchaseId: compra?.id,
    purchaseOrderItemId: purchaseOrderItemId ?? undefined,
  });
 
   const onSubmit = async (data: InputPurchaseFormData) => {  
    if (
      purchaseOrderItemId &&
      maxQuantityKg &&
      data.quantity > maxQuantityKg
    ) {
      showToast({
        type: "error",
        title: "Quantidade inválida",
        message: "A quantidade excede o saldo disponível do pedido.",
      });
      return;
    }         
     mutate({
      ...data,
      purchaseOrderItemId: purchaseOrderItemId ?? undefined,      
     }, {
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
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  useEffect(() => {
    if (productId) {
      form.setValue("productId", productId, { shouldValidate: true });
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

    if (typeof unitPriceFromOrder === "number") {
      form.setValue("unitPrice", unitPriceFromOrder, {
        shouldValidate: true,
      });
    }

    if (typeof suggestedQuantity === "number") {
      form.setValue("quantity", suggestedQuantity, { shouldValidate: true });
    }
  }, [productId, customerId, memberId, memberAdressId, unitPriceFromOrder, suggestedQuantity, form]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[calc(100%-1rem)] sm:w-full max-h-[95vh] overflow-scroll scrollbar-hide rounded-2xl">
        <DialogHeader>
          <DialogTitle>
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
            {/* Data, Nota Fiscal */}
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
                {/* Nota Fiscal */}
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

            {/* Sócio, Endereço */}
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
                      disabled={!!purchaseOrderItemId}
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
                      disabled={!!purchaseOrderItemId || !socioId || addresses.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={socioAdressPlaceholder} />
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
            
              {/* Produto, Fornecedor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!!purchaseOrderItemId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma insumo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                <div className="flex items-center gap-2">
                                  <span>{product.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {
                                      PRODUCT_CLASS_OPTIONS.find(
                                        (option) => option.value === product.class)?.label || product.class
                                    }
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
                {/* Fornecedor */}
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <FormControl>
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
                                <div className="flex items-center gap-2">
                                  <span>{customer.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {customer.cpf_cnpj}
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
              </div>

              {/* Quantidade, Preço e Valor Total */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
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
                  name="unitPrice"
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

              {/* Fazenda */}
              <div>
                <FormField
                  control={form.control}
                  name="farmId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depósito</FormLabel>
                      <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um depósito" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {farms.map((farm) => (
                                <SelectItem key={farm.id} value={farm.id}>
                                  {farm.name}
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

              {/* Condição de Pagamento, Data de Vencimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição de Pagamento</FormLabel>
                      <FormControl>
                      <Select
                        onValueChange={(value: PaymentCondition) =>
                          field.onChange(value)
                        }
                        defaultValue={field.value}
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
                {/* Data de Vencimento */}
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
                className="mt-4 w-full bg-green text-white hover:bg-green/90"
                onClick={() => console.log(form.getValues())}
              >
                {isPending ? <FaSpinner className="animate-spin" /> : "Salvar"}
              </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertPurchaseModal;
