import { PercentInput, QuantityInput } from "@/components/inputs";
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
import { useCycle } from "@/contexts/CycleContext";
import { useSmartToast } from "@/contexts/ToastContext";
import { getToken } from "@/lib/auth-client";
import { getCycle } from "@/lib/cycle";
import { IndustryHarvestFormData, industryHarvestSchema } from "@/lib/schemas/industryHarvest";
import {
  IndustryDeposit,
  IndustryHarvest,
  IndustryTransporter
} from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { ComboBoxOption } from "@/components/combo-option";
import { normalizeNumber } from "@/app/_helpers/normalize-number";

interface UpsertHarvestModalProps {
  colheita?: IndustryHarvest;
  isOpen: boolean;
  onClose: () => void;
  onHarvestCreated?: () => void;
  onUpdated?: () => void;
}

type TalhaoOption = {
  id: string;
  name: string;
  area: number;
};

const UpsertHarvestModal = ({
  colheita,
  isOpen,
  onClose,
  onHarvestCreated,
}: UpsertHarvestModalProps) => {
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<IndustryDeposit[]>([]);
  const [transporters, setTransporters] = useState<IndustryTransporter[]>([]);
  const [talhoes, setTalhoes] = useState<TalhaoOption[]>([]);
  const { selectedCycle } = useCycle();
  const { showToast } = useSmartToast();

  const form = useForm<IndustryHarvestFormData>({
    resolver: zodResolver(industryHarvestSchema),
    defaultValues: {
      date: colheita ? new Date(colheita.date) : new Date(),
      document: colheita?.document || "",
      talhaoId: colheita?.talhaoId || "",
      industryDepositId: colheita?.industryDepositId || "",
      industryTransporterId: colheita?.industryTransporterId || "",
      truckPlate: colheita?.truckPlate || "",
      truckDriver: colheita?.truckDriver || "",
      weightBt: normalizeNumber(colheita?.weightBt),
      weightTr: normalizeNumber(colheita?.weightTr),
      weightSubLiq: normalizeNumber(colheita?.weightSubLiq),
      humidity_percent: normalizeNumber(colheita?.humidity_percent),
      humidity_discount: normalizeNumber(colheita?.humidity_discount),
      humidity_kg: normalizeNumber(colheita?.humidity_kg),
      impurities_percent: normalizeNumber(colheita?.impurities_percent),
      impurities_discount: normalizeNumber(colheita?.impurities_discount),
      impurities_kg: normalizeNumber(colheita?.impurities_kg),
      tax_kg: normalizeNumber(colheita?.tax_kg),
      adjust_kg: normalizeNumber(colheita?.adjust_kg),
      weightLiq: normalizeNumber(colheita?.weightLiq),
    },
  });

  const weightBt = Number(form.watch("weightBt") ?? 0);
  const weightTr = Number(form.watch("weightTr") ?? 0);
  const impuritiesPercent = Number(form.watch("impurities_discount") ?? 0);
  const humidityPercent = Number(form.watch("humidity_discount") ?? 0);
  const taxPercent = Number(form.watch("tax_kg") ?? 0);
  const adjustPercent = Number(form.watch("adjust_kg") ?? 0);

  useEffect(() => {
    // 1. Sub-líquido
    const subLiq = weightBt - weightTr;

    // 2. Impurezas
    const impuritiesKg = (subLiq * impuritiesPercent) / 100;

    // 3. Umidade (base: sub-líquido - impurezas)
    const baseUmidade = subLiq - impuritiesKg;
    const humidityKg = (baseUmidade * humidityPercent) / 100;

    // 4. Peso líquido
    const weightLiq = subLiq - impuritiesKg - humidityKg - taxPercent + adjustPercent;
    
    // Atualiza estados finais
    form.setValue("weightSubLiq", Number.isFinite(subLiq) ? parseFloat(subLiq.toFixed(2)) : 0);
    form.setValue("impurities_kg", Number.isFinite(impuritiesKg) ? parseFloat(impuritiesKg.toFixed(2)) : 0);
    form.setValue("humidity_kg", Number.isFinite(humidityKg) ? parseFloat(humidityKg.toFixed(2)) : 0);
    form.setValue("weightLiq", Number.isFinite(weightLiq) ? parseFloat(weightLiq.toFixed(2)) : 0);
  }, [weightBt, weightTr, impuritiesPercent, humidityPercent, taxPercent, adjustPercent]);

  useEffect(() => {
    if (colheita) {
      form.reset({
        date: colheita.date ? new Date(colheita.date) : new Date(),
        document: colheita.document || "",
        talhaoId: colheita.talhaoId,
        industryDepositId: colheita.industryDepositId,
        industryTransporterId: colheita.industryTransporterId,
        truckPlate: colheita.truckPlate || "",
        truckDriver: colheita.truckDriver || "",
        weightBt: colheita.weightBt,
        weightTr: colheita.weightTr,
        weightSubLiq: colheita.weightSubLiq,
        humidity_percent: colheita.humidity_percent,
        humidity_discount: colheita.humidity_discount,
        humidity_kg: colheita.humidity_kg,
        impurities_percent: colheita.impurities_percent,
        impurities_discount: colheita.impurities_discount,
        impurities_kg: colheita.impurities_kg,
        tax_kg: colheita.tax_kg,
        adjust_kg: colheita.adjust_kg,
        weightLiq: colheita.weightLiq,
      });
    } else {
      form.reset();
    }
  }, [colheita, isOpen, form]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [depositoRes, transporterRes] = await Promise.all([
        fetch("/api/industry/deposit", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/industry/transporter", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
      const depositoData = await depositoRes.json();
      const transporterData = await transporterRes.json();
      setDeposits(depositoData);
      setTransporters(transporterData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (selectedCycle?.talhoes?.length) {
        setTalhoes(
          selectedCycle.talhoes.map((ct) => ({
            id: ct.talhaoId,
            name: ct.talhao.name,
            area: ct.talhao.area,
          }))
        );
      } else {
        // fallback — caso não tenha ciclo selecionado ou o ciclo não tenha talhões cadastrados
        setTalhoes([])
      }
    }, [selectedCycle]);

  const onSubmit = async (data: IndustryHarvestFormData) => {
    setLoading(true);
    const token = getToken();
    const cycle = getCycle();
    if (!cycle || !cycle.id) {
      showToast({
        type: "error",
        title: "Erro",
        message: "Nenhum ciclo de produção selecionado.",
      });
      setLoading(false);
      return;
    }
    const cycleId = cycle.id;
    console.log("Dados enviados para API:", {
      ...data,
      cycleId,
    });

    const url = colheita ? `/api/industry/harvest/${colheita.id}` : "/api/industry/harvest";
    const method = colheita ? "PUT" : "POST";

    const weightSubLiq = data.weightSubLiq;
    const impuritiePercent = data.impurities_percent;
    const impuritieKg = weightSubLiq * (impuritiePercent / 100);
    console.log("Quilos de impurezas:", impuritieKg);



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
      showToast({
        type: "error",
        title: "Erro",
        message: result.error || "Erro ao salvar colheita.",
      });
      setLoading(false);
      return;
    } else {
      showToast({
        type: "success",
        title: "Sucesso",
        message: colheita 
          ? "Colheita atualizada com sucesso!"
          : "Colheita cadastrada com sucesso!",
      });
      onClose();
      form.reset();
      if (onHarvestCreated) onHarvestCreated();
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
          <DialogTitle>Colheita</DialogTitle>
          <DialogDescription>
            {colheita ? "Editar colheita" : "Cadastrar colheita"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 gap-4">
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
                <div className="col-span-2">
                   <FormField
                    control={form.control}
                    name="talhaoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Talhão</FormLabel>
                          <FormControl>
                            {talhoes.length > 0 ? (
                              <ComboBoxOption
                                options={talhoes.map((t) => ({
                                  label: t.name,
                                  value: t.id,
                                }))}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Selecione um talhão"
                              />
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
              </div>
            </div>
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
            {/* peso */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="weightBt"
                render={({ field }) => (
                  <QuantityInput label="Peso Bruto" field={field} suffix=" kg" />
                )}
              />
              <FormField
                control={form.control}
                name="weightTr"
                render={({ field }) => (
                  <QuantityInput label="Tara" field={field} suffix=" kg" />
                )}
              />
              <FormField
                control={form.control}
                name="weightSubLiq"
                render={({ field }) => (
                  <QuantityInput label="Sub Líquido" field={field} suffix=" kg" readonly />
                )}
              />
            </div>
            {/* CLASSIFICAÇÃO */}
            {/* impureza */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="impurities_percent"
                render={({ field }) => (
                  <QuantityInput label="Impureza" field={field} />
                )}
              />
              <FormField
                control={form.control}
                name="impurities_discount"
                render={({ field }) => (
                  <PercentInput label="Desconto" field={field} />
                )}
              />
              <FormField
                control={form.control}
                name="impurities_kg"
                render={({ field }) => (
                  <QuantityInput label="Impureza" field={field} suffix=" kg" readonly />
                )}
              />
            </div>
            {/* umidade */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="humidity_percent"
                render={({ field }) => (
                  <QuantityInput label="Umidade" field={field} />
                )}
              />
              <FormField
                control={form.control}
                name="humidity_discount"
                render={({ field }) => (
                  <PercentInput label="Desconto" field={field} />
                )}
              />
              <FormField
                control={form.control}
                name="humidity_kg"
                render={({ field }) => (
                  <QuantityInput label="Umidade" field={field} suffix=" kg" readonly />
                )}
              />
            </div>

            {/* peso líquido */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tax_kg"
                render={({ field }) => (
                  <QuantityInput label="Taxa" field={field} suffix=" kg" />
                )}
              />
              <FormField
                control={form.control}
                name="adjust_kg"
                render={({ field }) => (
                  <QuantityInput label="Ajuste" field={field} suffix=" kg" />
                )}
              />
              <FormField
                control={form.control}
                name="weightLiq"
                render={({ field }) => (
                  <QuantityInput label="Peso Líquido" field={field} suffix=" kg" readonly />
                )}
              />
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

export default UpsertHarvestModal;
