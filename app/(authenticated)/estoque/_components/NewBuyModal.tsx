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

type Talhao = {
  id: string;
  name: string;
};

type Cultivar = {
  id: string;
  name: string;
};

type NewBuyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onHarvestCreated?: () => void; // <- nova prop opcional
};

const NewBuyModal = ({ isOpen, onClose, onHarvestCreated }: NewBuyModalProps) => {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [cultivarId, setCultivarId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [quantityKg, setQuantityKg] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [cultivarRes, talhaoRes] = await Promise.all([
        fetch("/api/cultivars/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/plots", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const cultivarData = await cultivarRes.json();
      const talhaoData = await talhaoRes.json();

      setCultivars(cultivarData);
      setTalhoes(talhaoData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!cultivarId  || !date || !quantityKg) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      console.log(cultivarId, supplier, date, quantityKg, notes);
      const res = await fetch("/api/buys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cultivarId,
          supplier,
          date,
          quantityKg: parseFloat(quantityKg),
          notes,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar colheita");

      toast.success("Compra cadastrada com sucesso!");
      onClose();
      resetForm();

      if (onHarvestCreated) onHarvestCreated(); // <- atualiza o estoque

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar compra");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCultivarId("");
    setSupplier("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setQuantityKg("");
    setNotes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inserir Compra</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
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
            <Label>Fornecedor</Label>
            <Input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>

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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewBuyModal;
