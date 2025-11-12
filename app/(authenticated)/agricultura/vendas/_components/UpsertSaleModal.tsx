import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCycle } from "@/contexts/CycleContext";
import { getToken } from "@/lib/auth-client";
import { getCycle } from "@/lib/cycle";
import { IndustrySaleFormData, industrySaleSchema } from "@/lib/schemas/industrySale";
import {
  IndustryDeposit,
  IndustrySale,
  IndustryTransporter,
  Customer
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

interface UpsertSaleModalProps {
  venda?: IndustrySale;
  isOpen: boolean;
  onClose: () => void;
  onSaleCreated?: () => void;
  onUpdated?: () => void;
}

const UpsertSaleModal = ({
  venda,
  isOpen,
  onClose,
  onSaleCreated,
}: UpsertSaleModalProps) => {
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<IndustryDeposit[]>([]);
  const [transporters, setTransporters] = useState<IndustryTransporter[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subLiquid, setSubLiquid] = useState(0);
  const [discountsKg, setDiscountsKg] = useState(0);
  const [liquid, setLiquid] = useState(0);
  const { selectedCycle } = useCycle();

  const form = useForm<IndustrySaleFormData>({
    resolver: zodResolver(industrySaleSchema),
    defaultValues: {
      date: venda ? new Date(venda.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      document: venda?.document || "",
      industryDepositId: venda?.industryDepositId || "",
      customerId: venda?.customerId || "",
      industryTransporterId: venda?.industryTransporterId || "",
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
      paymentCondition: venda?.paymentCondition || "APRAZO",
      dueDate: venda ? new Date(venda.dueDate || "").toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    },
  });

  const weightBt = Number(form.watch("weightBt") ?? 0);
  const weightTr = Number(form.watch("weightTr") ?? 0);
  const discountKg = Number(form.watch("discountsKg") ?? 0);

  useEffect(() => {
    // 1. Sub-líquido
    const subLiq = weightBt - weightTr;

    // 2. Peso líquido
    const weightLiq = subLiq - discountKg;
    
    // Atualiza estados finais
    setSubLiquid(subLiq);
    setDiscountsKg(discountsKg);
    setLiquid(weightLiq);
  }, [weightBt, weightTr, discountsKg]);

  useEffect(() => {
    if (venda) {
      form.reset({
        date: new Date(venda.date).toISOString().split("T")[0],
        document: venda.document || "",
        industryDepositId: venda.industryDepositId,
        customerId: venda.customerId,
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
        paymentCondition: venda.paymentCondition,
        dueDate: venda.dueDate ? new Date(venda.dueDate).toISOString().split("T")[0] : "",
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

  const onSubmit = async (data: IndustrySaleFormData) => {
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

    const url = venda ? `/api/industry/sale/${venda.id}` : "/api/industry/sale";
    const method = venda ? "PUT" : "POST";

    const weightSubLiq = data.weightSubLiq;

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
      toast.warning(result.error || "Erro ao salvar venda.", {
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
      form.reset();
      if (onSaleCreated) onSaleCreated();
    }

    setLoading(false);
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <Input type="date" {...form.register("date")} />
              </div>
              <div>
                <Label>Documento</Label>
                <Input type="text" {...form.register("document")} />
              </div>
            </div>
            <div className="grid grid-cols gap-4">
              <div>
                <Label>Cliente</Label>
                {customers.length > 0 ? (
                  <select
                    {...form.register("customerId")}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="" className="font-light">Selecione</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}  className="font-light">
                          <span>{c.name} </span>
                        </option>
                      ))}
                        </select>
                      ) : (
                        <div className="text-xs flex items-center justify-start space-x-4">
                          <p>Nenhum talhão vinculado ao ciclo.</p>  
                          <Link href="/agricultura/safras">
                            <span className="text-green text-xs">
                              Cadastre um talhão ou vincule um talhão existente ao ciclo.
                            </span>
                          </Link>
                        </div>
                      )}
                    {form.formState.errors.customerId && (
                      <span className="text-xs text-red-500">
                        {form.formState.errors.customerId.message}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Depósito</Label>
                <select
                  {...form.register("industryDepositId")}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="" className=" text-md font-light">Selecione</option>
                  {deposits.map((d) => (
                    <option key={d.id} value={d.id} className="font-light">
                      {d.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.industryDepositId && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.industryDepositId.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Transportador</Label>
                <select
                  {...form.register("industryTransporterId")}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value=""  className="font-light">Selecione</option>
                  {transporters.map((t) => (
                    <option key={t.id} value={t.id}  className="font-light">
                      {t.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.industryTransporterId && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.industryTransporterId.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Placa</Label>
                <Input type="text" {...form.register("truckPlate")} />
              </div>
              <div>
                <Label>Motorista</Label>
                <Input type="text" {...form.register("truckDriver")} />
                {form.formState.errors.truckDriver && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.truckDriver.message}
                  </span>
                )}
              </div>
            </div>
            {/* peso */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Peso Bruto (kg)</Label>
                <Input
                  type="number"
                  {...form.register("weightBt", { valueAsNumber: true })}
                  step="0.01"
                  placeholder="Ex: 1200"
                />
                {form.formState.errors.weightBt && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.weightBt.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Tara (kg)</Label>
                <Input
                  type="number"
                  {...form.register("weightTr", { valueAsNumber: true })}
                  step="0.01"
                  placeholder="Ex: 1200"
                />
                {form.formState.errors.weightTr && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.weightTr.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Sub Líquido (kg)</Label>
                <Input
                  type="number"
                  {...form.register("weightSubLiq", { valueAsNumber: true })}
                  value={Number(subLiquid).toFixed(2)}
                  readOnly
                />
                {form.formState.errors.weightSubLiq && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.weightSubLiq.message}
                  </span>
                )}
              </div>
            </div>
            {/* CLASSIFICAÇÃO */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Desconto (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("discountsKg", { valueAsNumber: true })}
                  placeholder="Ex: 14.5"
                />
                {form.formState.errors.discountsKg && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.discountsKg.message}
                  </span>
                )}
              </div>
            </div>

            {/* peso líquido */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Peso Líquido (kg)</Label>
                <Input
                  type="number"
                  {...form.register("weightLiq", { valueAsNumber: true })}
                  value={Number(liquid).toFixed(2)}
                  readOnly
                />
                {form.formState.errors.weightLiq && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.weightLiq.message}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green text-white mt-4"
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
          </Button>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertSaleModal;
