"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { getToken } from "@/lib/auth-client";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

type Farm = {
  id: string;
  name: string;
};

type Cultivar = {
  id: string;
  name: string;
};

type NewConsumptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConsumptionCreated?: () => void; // <- nova prop opcional
};

const NewConsumptionModal = ({
  isOpen,
  onClose,
  onConsumptionCreated,
}: NewConsumptionModalProps) => {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [cultivarId, setCultivarId] = useState("");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmId, setFarmId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [quantityKg, setQuantityKg] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [cultivarRes, farmRes] = await Promise.all([
        fetch("/api/cultivars/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/farms", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const cultivarData = await cultivarRes.json();
      const farmData = await farmRes.json();

      setCultivars(cultivarData);
      setFarms(farmData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!cultivarId || !farmId || !date || !quantityKg) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const token = getToken();

      const res = await fetch("/api/consumption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cultivarId,
          farmId,
          date,
          quantityKg: parseFloat(quantityKg),
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao cadastrar consumo.");
        return;
      }

      toast.success("Consumo cadastrado com sucesso!");
      onClose();
      resetForm();

      if (onConsumptionCreated) onConsumptionCreated(); // <- atualiza o estoque
    
    } catch (err) {
      console.error(err);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCultivarId("");
    setFarmId("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setQuantityKg("");
    setNotes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inserir Plantio</DialogTitle>
        </DialogHeader>

        <div>
          <Label>Cultivar</Label>
          <select
            value={cultivarId}
            onChange={(e) => setCultivarId(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Selecione</option>
            {cultivars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Destino</Label>
          <select
            value={farmId}
            onChange={(e) => setFarmId(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Selecione</option>
            {farms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Data</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Quantidade (kg)</Label>
            <Input
              type="number"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              placeholder="Ex: 1200"
            />
          </div>
        </div>

        <div>
          <Label>Observações</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green text-white"
        >
          {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NewConsumptionModal;
