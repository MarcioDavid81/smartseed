"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { getToken } from "@/lib/auth-client";
import { Beneficiation, Cultivar } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";

interface UpsertBeneficiationModalProps {
  descarte?: Beneficiation;
  isOpen: boolean;
  onClose: () => void;
  onBeneficiotionCreated?: () => void;
  onUpdated?: () => void;
}

const descarteSchema = z.object({
  cultivarId: z.string().min(1, "Selecione uma cultivar"),
  date: z.string().min(1, "Selecione uma data"),
  quantityKg: z.coerce.number().min(1, "Quantidade é obrigatória"),
  notes: z.string(),
});

type BeneficiationFormData = z.infer<typeof descarteSchema>;

const UpsertBeneficiationModal = ({
  descarte,
  isOpen,
  onClose,
  onBeneficiotionCreated,
  onUpdated,
}: UpsertBeneficiationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [cultivars, setCultivars] = useState<Cultivar[]>([]);

  const form = useForm<BeneficiationFormData>({
    resolver: zodResolver(descarteSchema),
    defaultValues: {
      cultivarId: descarte?.cultivarId ?? "",
      date: descarte
        ? new Date(descarte.date).toISOString().split("T")[0]
        : format(new Date(), "yyyy-MM-dd"),
      quantityKg: descarte?.quantityKg ?? 0,
      notes: descarte?.notes ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BeneficiationFormData>({
    resolver: zodResolver(descarteSchema),
    defaultValues: {
      cultivarId: descarte?.cultivarId ?? "",
      date: descarte ? new Date(descarte.date).toISOString().split("T")[0] : "",
      quantityKg: descarte?.quantityKg ?? 0,
      notes: descarte?.notes ?? "",
    },
  });

  useEffect(() => {
    if (descarte) {
      reset({
        cultivarId: descarte.cultivarId,
        date: new Date(descarte.date).toISOString().split("T")[0],
        quantityKg: descarte.quantityKg,
        notes: descarte.notes || "",
      });
    } else {
      reset();
    }
  }, [descarte, isOpen, reset]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();

      const [cultivarRes] = await Promise.all([
        fetch("/api/cultivars/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const cultivarData = await cultivarRes.json();

      setCultivars(cultivarData);
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const onSubmit = async (data: BeneficiationFormData) => {
    console.log(" 📦 Data enviada:", data);
    setLoading(true);
    const token = getToken();

    const url = descarte
      ? `/api/beneficiation/${descarte.id}`
      : "/api/beneficiation";
    const method = descarte ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.warning(result.error || "Erro ao salvar descarte.", {
        style: {
          backgroundColor: "#F0C531",
          color: "white",
        },
        icon: "❌",
      });
    } else {
      toast.success(
        descarte
          ? "Descarte atualizada com sucesso!"
          : "Descarte cadastrada com sucesso!",
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
      if (onBeneficiotionCreated) onBeneficiotionCreated();
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Descarte</DialogTitle>
          <DialogDescription>
            {descarte ? "Editar descarte" : "Cadastrar descarte"}
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

export default UpsertBeneficiationModal;
