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
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa";
import { Farm } from "@/types";

interface NewPlotModalProps {
  isOpen: boolean;
  onClose: () => void;
}



const NewPlotModal = ({ isOpen, onClose }: NewPlotModalProps) => {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [farmId, setFarmId] = useState("");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchFarms() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/farms", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setFarms(data);
  }

  async function handleSubmit() {
    if (!name || !area || !farmId) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    const res = await fetch("/api/plots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        area: parseFloat(area),
        farmId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Erro ao cadastrar talhão.");
    } else {
      toast.success("Talhão cadastrado com sucesso!");
      onClose();
      setName("");
      setArea("");
      setFarmId("");
    }

    setLoading(false);
  }

  useEffect(() => {
    if (isOpen) fetchFarms();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Talhão</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Nome do talhão"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          placeholder="Área em hectares"
          type="number"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />

        <select
          className="border rounded p-2"
          value={farmId}
          onChange={(e) => setFarmId(e.target.value)}
        >
          <option value="">Selecione uma fazenda</option>
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.name}
            </option>
          ))}
        </select>

        <Button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-green text-white"
        >
          {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NewPlotModal;
