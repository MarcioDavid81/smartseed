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
import { toast } from "sonner";

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
  const [subLiquid, setSubLiquid] = useState(0);
  const [impuritiesKg, setImpuritiesKg] = useState(0);
  const [humidityKg, setHumidityKg] = useState(0);
  const [liquid, setLiquid] = useState(0);
  const { selectedCycle } = useCycle();

  const form = useForm<IndustryHarvestFormData>({
    resolver: zodResolver(industryHarvestSchema),
    defaultValues: {
      date: colheita ? new Date(colheita.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      document: colheita?.document || "",
      talhaoId: colheita?.talhaoId || "",
      industryDepositId: colheita?.industryDepositId || "",
      industryTransporterId: colheita?.industryTransporterId || "",
      truckPlate: colheita?.truckPlate || "",
      truckDriver: colheita?.truckDriver || "",
      weightBt: colheita?.weightBt || 0,
      weightTr: colheita?.weightTr || 0,
      weightSubLiq: colheita?.weightSubLiq || 0,
      humidity_percent: colheita?.humidity_percent || 0,
      humidity_discount: colheita?.humidity_discount || 0,
      humidity_kg: colheita?.humidity_kg || 0,
      impurities_percent: colheita?.impurities_percent || 0,
      impurities_discount: colheita?.impurities_discount || 0,
      impurities_kg: colheita?.impurities_kg || 0,
      weightLiq: colheita?.weightLiq || 0,
    },
  });

  const weightBt = form.watch("weightBt") || 0;
  const weightTr = form.watch("weightTr") || 0;
  const impuritiesPercent = form.watch("impurities_discount") || 0;
  const humidityPercent = form.watch("humidity_discount") || 0;

  useEffect(() => {
    // 1. Sub-líquido
    const subLiq = weightBt - weightTr;

    // 2. Impurezas
    const impuritiesKg = (subLiq * impuritiesPercent) / 100;

    // 3. Umidade (base: sub-líquido - impurezas)
    const baseUmidade = subLiq - impuritiesKg;
    const humidityKg = (baseUmidade * humidityPercent) / 100;

    // 4. Peso líquido
    const weightLiq = subLiq - impuritiesKg - humidityKg;
    
    // Atualiza estados finais
    setSubLiquid(subLiq);
    setImpuritiesKg(impuritiesKg);
    setHumidityKg(humidityKg);
    setLiquid(weightLiq);
  }, [weightBt, weightTr, impuritiesPercent, humidityPercent]);

  useEffect(() => {
    if (colheita) {
      form.reset({
        date: new Date(colheita.date).toISOString().split("T")[0],
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
      toast.error("Nenhum ciclo de produção selecionado.");
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
      toast.warning(result.error || "Erro ao salvar colheita.", {
        style: {
          backgroundColor: "#F0C531",
          color: "white",
        },
        icon: "❌",
      });
    } else {
      toast.success(
        colheita
          ? "Colheita atualizada com sucesso!"
          : "Colheita cadastrada com sucesso!",
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
                <Label>Talhão</Label>
                {talhoes.length > 0 ? (
                  <select
                    {...form.register("talhaoId")}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="" className="font-light">Selecione</option>
                      {talhoes.map((t) => (
                        <option key={t.id} value={t.id}  className="font-light">
                          <span>{t.name} </span>
                          <span>({t.area} ha)</span>
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
                    {form.formState.errors.talhaoId && (
                      <span className="text-xs text-red-500">
                        {form.formState.errors.talhaoId.message}
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
                  value={(subLiquid.toFixed(2))}
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
            {/* impureza */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Impureza</Label>
                <Input
                  type="number"
                  step="0.1"
                  {...form.register("impurities_percent", { valueAsNumber: true })}
                  placeholder="Ex: 14.5"
                />
                {form.formState.errors.impurities_percent && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.impurities_percent.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Porcentagem (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  {...form.register("impurities_discount", { valueAsNumber: true })}
                  placeholder="Ex: 2.5"
                />
                {form.formState.errors.impurities_discount && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.impurities_discount.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Desconto (kg)</Label>
                <Input
                  type="number"
                  {...form.register("impurities_kg", { valueAsNumber: true })}
                  value={(impuritiesKg.toFixed(2))}
                  readOnly
                />
                {form.formState.errors.impurities_kg && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.impurities_kg.message}
                  </span>
                )}
              </div>
            </div>
            {/* umidade */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Umidade</Label>
                <Input
                  type="number"
                  step="0.1"
                  {...form.register("humidity_percent", { valueAsNumber: true })}
                  placeholder="Ex: 15.2"
                />
                {form.formState.errors.humidity_percent && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.humidity_percent.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Porcentagem (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  {...form.register("humidity_discount", { valueAsNumber: true })}
                  placeholder="Ex: 3.8"
                />
                {form.formState.errors.humidity_discount && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.humidity_discount.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Desconto (kg)</Label>
                <Input
                  type="number"
                  {...form.register("humidity_kg", { valueAsNumber: true })}
                  value={(humidityKg.toFixed(2))}
                  readOnly
                />
                {form.formState.errors.humidity_kg && (
                  <span className="text-xs text-red-500">
                    {form.formState.errors.humidity_kg.message}
                  </span>
                )}
              </div>
            </div>

            {/* peso líquido */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <Label>Peso Líquido (kg)</Label>
                <Input
                  type="number"
                  {...form.register("weightLiq", { valueAsNumber: true })}
                  value={(liquid.toFixed(2))}
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

export default UpsertHarvestModal;
