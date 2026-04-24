import { PRODUCT_TYPE_LABELS } from "@/app/(authenticated)/_constants/products";
import { formatNumber } from "@/app/_helpers/currency";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSmartToast } from "@/contexts/ToastContext";
import { ApiError } from "@/lib/http/api-error";
import { IndustrySaleFormData, industrySaleSchema } from "@/lib/schemas/industrySale";
import { useIndustryDeposits } from "@/queries/industry/use-deposits-query";
import { useIndustryTransporters } from "@/queries/industry/use-transporter-query";
import { useUpsertIndustrySale } from "@/queries/industry/use-upsert-industry-sale";
import { useCustomers } from "@/queries/registrations/use-customer";
import { useMembers } from "@/queries/registrations/use-member";
import {
  IndustrySale} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentCondition, ProductType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

interface UpsertSaleModalProps {
  venda?: IndustrySale;
  isOpen: boolean;
  onClose: () => void;

  /** 🆕 contexto de atendimento */
  saleContractItemId?: string;
  product?: ProductType;
  customerId?: string;
  customerName?: string;
  memberId?: string;
  memberName?: string;
  memberAdressId?: string;
  unitPrice?: number;
  maxQuantityKg?: number;
  initialQuantity?: number;
}

const UpsertIndustrySaleModal = ({
  venda,
  isOpen,
  onClose,
  saleContractItemId,
  product,
  customerId,
  customerName,
  memberId,
  memberName,
  memberAdressId,
  unitPrice: unitPriceFromSale,
  maxQuantityKg,
  initialQuantity,
}: UpsertSaleModalProps) => {
  const { showToast } = useSmartToast();

  const suggestedQuantity = initialQuantity ?? maxQuantityKg ?? undefined;
  const customerPlaceholder = customerName || "Selecione um fornecedor";
  const socioPlaceholder = memberName || "Selecione um sócio";
  const socioAdressPlaceholder = memberAdressId || "Primeiro selecione um sócio";

  const form = useForm<IndustrySaleFormData>({
    resolver: zodResolver(industrySaleSchema),
    defaultValues: {
      date: venda ? new Date(venda.date) : new Date(),
      document: venda?.document || "",
      product: venda?.product || undefined,
      industryDepositId: venda?.industryDepositId || "",
      customerId: venda?.customerId || "",
      memberId: venda?.memberId || "",
      memberAdressId: venda?.memberAdressId || "",
      industryTransporterId: venda?.industryTransporterId || null,
      truckPlate: venda?.truckPlate || "",
      truckDriver: venda?.truckDriver || "",
      weightBt: venda?.weightBt || 0,
      weightTr: venda?.weightTr || 0,
      weightSubLiq: venda?.weightSubLiq || 0,
      discountsKg: venda?.discountsKg || 0,
      weightLiq: venda?.weightLiq || 0,
      unitPrice: venda?.unitPrice ?? unitPriceFromSale ?? 0,
      totalPrice: venda?.totalPrice || 0,
      notes: venda?.notes || "",
      paymentCondition: venda?.paymentCondition || PaymentCondition.AVISTA,
      dueDate: venda?.dueDate ? new Date(venda.dueDate) : undefined,
      saleContractItemId: saleContractItemId ?? undefined,
    },
  });

  const depositId = form.watch("industryDepositId");

  // Cálculos automáticos para manter consistência com o schema e envio
  const weightBt = Number(form.watch("weightBt") ?? 0);
  const weightTr = Number(form.watch("weightTr") ?? 0);
  const discountsKg = Number(form.watch("discountsKg") ?? 0);
  const unitPrice = Number(form.watch("unitPrice") ?? 0);

  useEffect(() => {
    
    const subLiq = weightBt - weightTr;
    const liq = subLiq - discountsKg;
    const total = liq * unitPrice;

    form.setValue("weightSubLiq", Number.isFinite(subLiq) ? parseFloat(subLiq.toFixed(2)) : 0);
    form.setValue("weightLiq", Number.isFinite(liq) ? parseFloat(liq.toFixed(2)) : 0);
    form.setValue("totalPrice", Number.isFinite(total) ? parseFloat(total.toFixed(2)) : 0);
  }, [weightBt, weightTr, discountsKg, unitPrice, form]);

  useEffect(() => {
    if (!isOpen) return;

    if (venda) {
      form.reset({
        date: new Date(venda.date),
        document: venda.document || "",
        product: venda.product || undefined,
        industryDepositId: venda.industryDepositId,
        customerId: venda.customerId || "",
        memberId: venda.memberId || "",
        memberAdressId: venda.memberAdressId || "",
        industryTransporterId: venda.industryTransporterId,
        truckPlate: venda.truckPlate || "",
        truckDriver: venda.truckDriver || "",
        weightBt: venda.weightBt,
        weightTr: venda.weightTr,
        weightSubLiq: venda.weightSubLiq,
        discountsKg: venda.discountsKg,
        weightLiq: venda.weightLiq,
        unitPrice: venda.unitPrice,
        totalPrice: venda.totalPrice,
        notes: venda.notes || "",
        paymentCondition: venda.paymentCondition ?? PaymentCondition.AVISTA,
        dueDate: venda.dueDate ? new Date(venda.dueDate) : undefined,
        saleContractItemId: saleContractItemId ?? undefined,
      });
    } else {
      form.reset({
        date: new Date(),
        saleContractItemId: saleContractItemId ?? undefined,
        product: product ?? undefined,
        industryDepositId: "",
        customerId: customerId ?? "",
        memberId: memberId ?? "",
        memberAdressId: memberAdressId ?? "",
        unitPrice: unitPriceFromSale ?? 0,
        weightLiq: suggestedQuantity ?? 0,
      });
    }
  }, [
    venda,
    isOpen,
    saleContractItemId,
    product,
    customerId,
    memberId,
    memberAdressId,
    unitPriceFromSale,
    suggestedQuantity,
    form,
  ]);

  const { data: deposits = [] } = useIndustryDeposits();
  const { data: transporters = [] } = useIndustryTransporters();
  const { data: customers = [] } = useCustomers();
  const { data: members = [] } = useMembers();
  const socioId = form.watch("memberId");
  const selectedMember = members.find(m => m.id === socioId);
  const addresses = selectedMember?.adresses ?? [];

  const selectedProduct = form.watch("product");
  const availableDeposits = deposits
  .map((deposit) => {
    const stock = deposit.industryStocks?.find(
      (s) => s.product === selectedProduct && s.quantity > 0
    );

    if (!stock) return null;

    return {
      id: deposit.id,
      name: deposit.name,
      quantity: stock.quantity,
    };
  })
  .filter(Boolean);

  
  const { mutate, isPending } = useUpsertIndustrySale({
    saleId: venda?.id,
    saleContractItemId: saleContractItemId ?? undefined,
  });
  
  const router = useRouter();

  const onSubmit = (data: IndustrySaleFormData) => {  
    if (
      saleContractItemId &&
      maxQuantityKg &&
      data.weightLiq > maxQuantityKg
    ) {
      showToast({
        type: "error",
        title: "Quantidade inválida",
        message: "A quantidade excede o saldo disponível do contrato.",
      });
      return;
    }
    mutate({
      ...data,
      saleContractItemId: saleContractItemId ?? undefined,
    }, {
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
    if (!isOpen) form.reset();
  }, [isOpen, form]);

    useEffect(() => {
      if (product) {
        form.setValue("product", product, { shouldValidate: true });
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

      if (typeof unitPriceFromSale === "number") {
        form.setValue("unitPrice", unitPriceFromSale, {
          shouldValidate: true,
        });
      }
  
      if (typeof suggestedQuantity === "number") {
        form.setValue("weightLiq", suggestedQuantity, { shouldValidate: true });
      }
    }, [product, customerId, memberId, memberAdressId, unitPriceFromSale, suggestedQuantity, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[calc(100%-1rem)] sm:w-full max-h-[95vh] overflow-scroll scrollbar-hide rounded-2xl">
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
              {/* Data, Documento, Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
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
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Documento</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-2">
                  {/* Cliente */}
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <FormControl>
                          <ComboBoxOption
                            options={customers.map((c) => ({
                              label: c.name,
                              value: c.id,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={customerPlaceholder}
                            disabled={!!saleContractItemId}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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

              {/* Depósito e Produto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="product"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("industryDepositId", "");
                          }}
                          disabled={!!saleContractItemId}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder="Selecione um produto"
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
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
                  name="industryDepositId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depósito</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedProduct}
                      >
                        <FormControl>
                          <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedProduct
                                ? "Selecione um produto primeiro"
                                : availableDeposits.length === 0
                                ? "Sem estoque disponível"
                                : "Selecione um depósito"
                            }
                          />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableDeposits.map((deposit) => (
                            <SelectItem key={deposit?.id || ""} value={deposit?.id || ""}>
                              <div className="flex justify-between gap-2 w-full">
                                <span>{deposit?.name || ""}</span>
                                <span className="text-muted-foreground">
                                  {formatNumber(deposit?.quantity || 0)} kg
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

              {/* Transportador, Placa e Motorista */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="industryTransporterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transportador</FormLabel>
                        <FormControl>
                          <ComboBoxOption
                            options={transporters.map((t) => ({
                              label: t.fantasyName || t.name,
                              value: t.id,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione um transportador"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="truckPlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="truckDriver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motorista</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Peso Bruto, Tara e Sub Líquido */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="weightBt"
                  render={({ field }) => (
                    <QuantityInput label="Peso Bruto" suffix=" Kg" placeholder="0,00" field={field} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightTr"
                  render={({ field }) => (
                    <QuantityInput label="Tara" suffix=" Kg" placeholder="0,00" field={field} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightSubLiq"
                  render={({ field }) => (
                    <QuantityInput label="Sub Líquido" suffix=" Kg" placeholder="0,00" field={field} readonly />
                  )}
                />
              </div>

              {/* Desconto, Peso Líquido e Preço Unitário */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="discountsKg"
                  render={({ field }) => (
                    <QuantityInput label="Desconto" suffix=" Kg" placeholder="0,00" field={field} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightLiq"
                  render={({ field }) => (
                    <QuantityInput label="Peso Líquido" suffix=" Kg" placeholder="0,00" field={field} readonly />
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <MoneyInput
                      label="Preço Unitário"
                      field={field}
                      readonly={!!saleContractItemId}
                    />
                  )}
                />
              </div>

              {/* Preço Total e Condição de Pagamento (FormField + condicional APRAZO) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="totalPrice"
                  render={({ field }) => (
                    <MoneyInput label="Preço Total" field={field} readonly />
                  )}
                />
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
                {form.watch("paymentCondition") === PaymentCondition.APRAZO && (
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

export default UpsertIndustrySaleModal;
