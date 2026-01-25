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
import { useCycle } from "@/contexts/CycleContext";
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { getCycle } from "@/lib/cycle";
import { ApiError } from "@/lib/http/api-error";
import { IndustrySaleFormData, industrySaleSchema } from "@/lib/schemas/industrySale";
import { useUpsertIndustrySale } from "@/queries/industry/use-upsert-industry-sale";
import {
  IndustryDeposit,
  IndustrySale,
  IndustryTransporter,
  Customer
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentCondition } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";

interface UpsertSaleModalProps {
  venda?: IndustrySale;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertSaleModal = ({
  venda,
  isOpen,
  onClose,
}: UpsertSaleModalProps) => {
  const [deposits, setDeposits] = useState<IndustryDeposit[]>([]);
  const [transporters, setTransporters] = useState<IndustryTransporter[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { selectedCycle } = useCycle();
  const { showToast } = useSmartToast();

  const form = useForm<IndustrySaleFormData>({
    resolver: zodResolver(industrySaleSchema),
    defaultValues: {
      date: venda ? new Date(venda.date) : new Date(),
      document: venda?.document || "",
      industryDepositId: venda?.industryDepositId || "",
      customerId: venda?.customerId || "",
      industryTransporterId: venda?.industryTransporterId || null,
      truckPlate: venda?.truckPlate || "",
      truckDriver: venda?.truckDriver || "",
      weightBt: venda?.weightBt || 0,
      weightTr: venda?.weightTr || 0,
      weightSubLiq: venda?.weightSubLiq || 0,
      discountsKg: venda?.discountsKg || 0,
      weightLiq: venda?.weightLiq || 0,
      unitPrice: venda?.unitPrice || 0,
      totalPrice: venda?.totalPrice || 0,
      notes: venda?.notes || "",
      paymentCondition: venda?.paymentCondition || PaymentCondition.AVISTA,
      dueDate: venda?.dueDate ? new Date(venda.dueDate) : undefined,
    },
  });

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
    if (venda) {
      form.reset({
        date: new Date(venda.date),
        document: venda.document || "",
        industryDepositId: venda.industryDepositId,
        customerId: venda.customerId,
        industryTransporterId: venda.industryTransporterId || "",
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
      });
    } else {
      form.reset();
    }
  }, [venda, isOpen, form]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [depositoRes, transporterRes, customerRes] = await Promise.all([
        fetch("/api/industry/deposit", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/industry/transporter", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);
      
      const depositoData = await depositoRes.json();
      const transporterData = await transporterRes.json();
      const customerData = await customerRes.json();
      setDeposits(depositoData);
      setTransporters(transporterData);
      setCustomers(customerData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const cycle = getCycle();
  
  const { mutate, isPending } = useUpsertIndustrySale({
    cycleId: cycle?.id!,
    saleId: venda?.id,
  });
  
  const onSubmit = (data: IndustrySaleFormData) => {
    if (!cycle?.id) {
      showToast({
        type: "error",
        title: "Erro",
        message: "Nenhum ciclo de produção selecionado.",
      });
      return;
    }
  
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Venda</DialogTitle>
          <DialogDescription>
            {venda ? "Editar venda" : "Cadastrar venda"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-4 gap-4">
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
                            placeholder="Selecione um cliente"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Depósito e Transportador */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industryDepositId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Depósito</FormLabel>
                      <FormControl>
                        <ComboBoxOption
                          options={deposits.map((d) => ({
                            label: d.name,
                            value: d.id,
                          }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Selecione um depósito"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industryTransporterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transportador</FormLabel>
                      <FormControl>
                        <ComboBoxOption
                          options={transporters.map((t) => ({
                            label: t.name,
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

              {/* Veículo */}
              <div className="grid grid-cols-2 gap-4">
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

              {/* Pesos */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="weightBt"
                  render={({ field }) => (
                    <QuantityInput label="Peso Bruto" field={field} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightTr"
                  render={({ field }) => (
                    <QuantityInput label="Tara" field={field} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightSubLiq"
                  render={({ field }) => (
                    <QuantityInput label="Sub Líquido" field={field} readonly />
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="discountsKg"
                  render={({ field }) => (
                    <QuantityInput label="Desconto" field={field} />
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightLiq"
                  render={({ field }) => (
                    <QuantityInput label="Peso Líquido" field={field} readonly />
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <MoneyInput label="Preço Unitário" field={field} />
                  )}
                />
              </div>

              {/* Condição de Pagamento (FormField + condicional APRAZO) */}
              <div className="grid grid-cols-3 gap-4">
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
                className="w-full bg-green text-white mt-4"
              >
                {isPending ? <FaSpinner className="animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertSaleModal;
