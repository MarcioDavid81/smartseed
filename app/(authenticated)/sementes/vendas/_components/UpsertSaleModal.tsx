"use client";

import { formatCurrency } from "@/app/_helpers/currency";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getToken } from "@/lib/auth-client";
import { getCycle } from "@/lib/cycle";
import { Cultivar } from "@/types";
import { Customer } from "@/types/customers";
import { Sale } from "@/types/sale";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentCondition } from "@prisma/client";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";

interface UpsertSaleModalProps {
  venda?: Sale;
  isOpen: boolean;
  onClose: () => void;
  onHarvestCreated?: () => void;
  onUpdated?: () => void;
}

const saleSchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  customerId: z.string().min(1, "Selecione um talhão"),
  date: z.string().min(1, "Selecione uma data"),
  invoiceNumber: z.string().min(1, "Informe a nota fiscal"),
  quantityKg: z.coerce.number().min(1, "Quantidade é obrigatória"),
  saleValue: z.coerce.number().min(1, "Preço total é obrigatório"),
  notes: z.string(),
  paymentCondition: z.nativeEnum(PaymentCondition),
  dueDate: z.string().min(1, "Selecione uma data de vencimento"),
});

type SaleFormData = z.infer<typeof saleSchema>;

const UpsertSaleModal = ({
  venda,
  isOpen,
  onClose,
  onHarvestCreated,
  onUpdated,
}: UpsertSaleModalProps) => {
  const [loading, setLoading] = useState(false);
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      cultivarId: venda?.cultivarId ?? "",
      customerId: venda?.customerId ?? "",
      date: venda
        ? new Date(venda.date).toISOString().split("T")[0]
        : format(new Date(), "yyyy-MM-dd"),
      invoiceNumber: venda?.invoiceNumber ?? "",
      saleValue: venda?.saleValue ?? 0,
      quantityKg: venda?.quantityKg ?? 0,
      notes: venda?.notes ?? "",
      paymentCondition: venda?.paymentCondition ?? PaymentCondition.AVISTA,
      dueDate: venda?.dueDate
        ? new Date(venda.dueDate).toISOString().split("T")[0]
        : "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      cultivarId: venda?.cultivarId ?? "",
      customerId: venda?.customerId ?? "",
      date: venda ? new Date(venda.date).toISOString().split("T")[0] : "",
      invoiceNumber: venda?.invoiceNumber ?? "",
      saleValue: venda?.saleValue ?? 0,
      quantityKg: venda?.quantityKg ?? 0,
      notes: venda?.notes ?? "",
      paymentCondition: venda?.paymentCondition ?? PaymentCondition.AVISTA,
      dueDate: venda?.dueDate
        ? new Date(venda.dueDate).toISOString().split("T")[0]
        : "",
    },
  });

  useEffect(() => {
    if (venda) {
      reset({
        cultivarId: venda.cultivarId,
        customerId: venda.customerId,
        date: new Date(venda.date).toISOString().split("T")[0],
        invoiceNumber: venda.invoiceNumber,
        saleValue: venda.saleValue,
        quantityKg: venda.quantityKg,
        notes: venda.notes || "",
        paymentCondition: venda.paymentCondition ?? PaymentCondition.AVISTA,
        dueDate: venda?.dueDate
          ? new Date(venda.dueDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      reset();
    }
  }, [venda, isOpen, reset]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [cultivarRes, customerRes] = await Promise.all([
        fetch("/api/cultivars/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/customers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const cultivarData = await cultivarRes.json();
      const customerData = await customerRes.json();

      setCultivars(cultivarData);
      setCustomers(customerData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const onSubmit = async (data: SaleFormData) => {
    setLoading(true);
    const token = getToken();
    const cycle = getCycle();
    if (!cycle || !cycle.id) {
      toast.error("Nenhum ciclo de produção selecionado.");
      setLoading(false);
      return;
    }
    const cycleId = cycle.id;
    console.log("Dados enviados para API:", {
      ...data,
      cycleId,
    });

    const url = venda ? `/api/sales/${venda.id}` : "/api/sales";
    const method = venda ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        cycleId,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.warning(result.error || "Erro ao salvar Venda.", {
        style: {
          backgroundColor: "#F0C531",
          color: "white",
        },
        icon: "❌",
      });
    } else {
      toast.success(
        venda
          ? "Venda atualizada com sucesso!"
          : "Venda cadastrada com sucesso!",
        {
          style: {
            backgroundColor: "#63B926",
            color: "white",
          },
          icon: "✅",
        }
      );
      onClose();
      reset();
      if (onHarvestCreated) onHarvestCreated();
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const paymentCondition = form.watch("paymentCondition");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Venda</DialogTitle>
          <DialogDescription>
            {venda ? "Editar venda" : "Cadastrar venda"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="cultivarId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cultivar</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Selecione</option>
                        {cultivars.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
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
                      <select
                        {...field}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Selecione</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantityKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade (Kg)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nota Fiscal</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="saleValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Ex: R$10.000,00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentCondition">Condição de Pagamento</Label>
                  <Select
                    onValueChange={(value: PaymentCondition) =>
                      form.setValue("paymentCondition", value)
                    }
                    defaultValue={form.getValues("paymentCondition")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a condição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVISTA">À Vista</SelectItem>
                      <SelectItem value="APRAZO">À Prazo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {paymentCondition  === "APRAZO" && (
                  <div>
                    <Label htmlFor="installments">Data de Vencimento</Label>
                    <Input
                      type="date"
                      {...form.register("dueDate")}
                    />
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Opcional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green text-white mt-4"
              >
                {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertSaleModal;
