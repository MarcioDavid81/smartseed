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
import { format, set } from "date-fns";
import { getToken } from "@/lib/auth-client";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

type Customer = {
  id: string;
  name: string;
};

type Cultivar = {
  id: string;
  name: string;
};

type NewSaleExitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaleCreated?: () => void; // <- nova prop opcional
};

const NewSaleExitModal = ({
  isOpen,
  onClose,
  onSaleCreated,
}: NewSaleExitModalProps) => {
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);
  const [cultivarId, setCultivarId] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [quantityKg, setQuantityKg] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [saleValue, setSaleValue] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    if (!cultivarId || !customerId || !date || !quantityKg) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const token = getToken();

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cultivarId,
          customerId,
          date,
          quantityKg: parseFloat(quantityKg),
          invoiceNumber,
          saleValue,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao salvar venda");
        return;
      }

      toast.success("Venda cadastrada com sucesso!");
      onClose();
      resetForm();
      if (onSaleCreated) onSaleCreated();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCultivarId("");
    setCustomerId("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setQuantityKg("");
    setInvoiceNumber("");
    setSaleValue("");
    setNotes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inserir Venda</DialogTitle>
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
          <Label>Cliente</Label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Selecione</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
          <Label>Nota Fiscal</Label>
          <Input
            type="number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Ex: 1456"
          />
        </div>
        <div>
          <Label>Valor Total</Label>
          <Input
            type="number"
            value={saleValue}
            onChange={(e) => setSaleValue(e.target.value)}
            placeholder="Ex: 14500"
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
      </DialogContent>
    </Dialog>
  );
};

export default NewSaleExitModal;
