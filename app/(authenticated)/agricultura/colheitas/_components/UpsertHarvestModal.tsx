import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCycle } from "@/contexts/CycleContext";
import { getToken } from "@/lib/auth-client";
import { getCycle } from "@/lib/cycle";
import { IndustryHarvestFormData, industryHarvestSchema } from "@/lib/schemas/industryHarvest";
import { IndustryDeposit, IndustryHarvest, IndustryProduct, IndustryTransporter, Talhao } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
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

const UpsertHarvestModal = ({
  colheita,
  isOpen,
  onClose,
  onHarvestCreated,
}: UpsertHarvestModalProps) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<IndustryProduct[]>([]);
  const [deposits, setDeposits] = useState<IndustryDeposit[]>([]);
  const [transporters, setTransporters] = useState<IndustryTransporter[]>([]);
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IndustryHarvestFormData>({
    resolver: zodResolver(industryHarvestSchema),
    defaultValues: {
      date: colheita ? new Date(colheita.date).toISOString().split("T")[0] : "",
      document: colheita?.document || "",
      productId: colheita?.productId || "",
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

  useEffect(() => {
    if (colheita) {
      reset({
        date: new Date(colheita.date).toISOString().split("T")[0],
        document: colheita.document || "",
        productId: colheita.productId,
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
      reset();
    }
  }, [colheita, isOpen, reset]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [produtoRes, talhaoRes, depositoRes, transporterRes] = await Promise.all([
        fetch("/api/industry/product", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/plots", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/industry/deposit", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/industry/transporter", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const produtoData = await produtoRes.json();
      const talhaoData = await talhaoRes.json();
      const depositoData = await depositoRes.json();
      const transporterData = await transporterRes.json();

      setProducts(produtoData);
      setTalhoes(talhaoData);
      setDeposits(depositoData);
      setTransporters(transporterData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

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
      reset();
      if (onHarvestCreated) onHarvestCreated();
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Colheita</DialogTitle>
          <DialogDescription>
            {colheita ? "Editar colheita" : "Cadastrar colheita"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <Input type="date" {...register("date")} />
              </div>
              <div>
                <Label>Documento</Label>
                <Input type="text" {...register("document")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Produto</Label>
                <select
                  {...register("productId")}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Selecione</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.productId && (
                  <span className="text-xs text-red-500">
                    {errors.productId.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Talhão</Label>
                <select
                  {...register("talhaoId")}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Selecione</option>
                  {talhoes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.talhaoId && (
                  <span className="text-xs text-red-500">
                    {errors.talhaoId.message}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Depósito</Label>
                <select
                  {...register("industryDepositId")}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Selecione</option>
                  {deposits.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors.industryDepositId && (
                  <span className="text-xs text-red-500">
                    {errors.industryDepositId.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Transportador</Label>
                <select
                  {...register("industryTransporterId")}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">Selecione</option>
                  {transporters.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.industryTransporterId && (
                  <span className="text-xs text-red-500">
                    {errors.industryTransporterId.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Placa</Label>
                <Input type="text" {...register("truckPlate")} />
              </div>
              <div>
                <Label>Motorista</Label>
                <Input type="text" {...register("truckDriver")} />
              </div>
            </div>
            {/* peso */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Peso Bruto (kg)</Label>
                <Input
                  type="number"
                  {...register("weightBt")}
                  placeholder="Ex: 1200"
                />
                {errors.weightBt && (
                  <span className="text-xs text-red-500">
                    {errors.weightBt.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Tara (kg)</Label>
                <Input
                  type="number"
                  {...register("weightTr")}
                  placeholder="Ex: 1200"
                />
                {errors.weightTr && (
                  <span className="text-xs text-red-500">
                    {errors.weightTr.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Sub Líquido (kg)</Label>
                <Input
                  type="number"
                  {...register("weightSubLiq")}
                  placeholder="Ex: 1200"
                />
                {errors.weightSubLiq && (
                  <span className="text-xs text-red-500">
                    {errors.weightSubLiq.message}
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
                  {...register("impurities_percent")}
                  placeholder="Ex: 1200"
                />
                {errors.impurities_percent && (
                  <span className="text-xs text-red-500">
                    {errors.impurities_percent.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Porcentage (%)</Label>
                <Input
                  type="number"
                  {...register("impurities_discount")}
                  placeholder="Ex: 1200"
                />
                {errors.impurities_discount && (
                  <span className="text-xs text-red-500">
                    {errors.impurities_discount.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Desconto (kg)</Label>
                <Input
                  type="number"
                  {...register("impurities_kg")}
                  placeholder="Ex: 1200"
                />
                {errors.impurities_kg && (
                  <span className="text-xs text-red-500">
                    {errors.impurities_kg.message}
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
                  {...register("humidity_percent")}
                  placeholder="Ex: 1200"
                />
                {errors.humidity_percent && (
                  <span className="text-xs text-red-500">
                    {errors.humidity_percent.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Porcentage (%)</Label>
                <Input
                  type="number"
                  {...register("humidity_discount")}
                  placeholder="Ex: 1200"
                />
                {errors.humidity_discount && (
                  <span className="text-xs text-red-500">
                    {errors.humidity_discount.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Desconto (kg)</Label>
                <Input
                  type="number"
                  {...register("humidity_kg")}
                  placeholder="Ex: 1200"
                />
                {errors.humidity_kg && (
                  <span className="text-xs text-red-500">
                    {errors.humidity_kg.message}
                  </span>
                )}
              </div>
            </div>

            {/* peso líquido */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Outros Descontos (kg)</Label>
                <Input
                  type="number"
                  {...register("weightLiq")}
                  placeholder="Ex: 1200"
                />
                {errors.weightLiq && (
                  <span className="text-xs text-red-500">
                    {errors.weightLiq.message}
                  </span>
                )}
              </div>
              <div className="col-span-2">
                <Label>Peso Líquido (kg)</Label>
                <Input
                  type="number"
                  {...register("weightLiq")}
                  placeholder="Ex: 1200"
                />
                {errors.weightLiq && (
                  <span className="text-xs text-red-500">
                    {errors.weightLiq.message}
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
      </DialogContent>
    </Dialog>
  );
};

export default UpsertHarvestModal;
