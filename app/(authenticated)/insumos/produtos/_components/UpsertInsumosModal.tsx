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
import { Textarea } from "@/components/ui/textarea";
import { getToken } from "@/lib/auth-client";
import {
  PRODUCT_CLASS_OPTIONS,
  PRODUCT_UNIT_OPTIONS,
} from "../../../_constants/insumos";
import { Insumo } from "@/types/insumo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";

interface UpsertInsumoModalProps {
  product?: Insumo;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const insumoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  class: z.string().min(1, "Classe é obrigatória"),
  unit: z.string().min(1, "Unidade é obrigatória"),
});

type InsumoFormData = z.infer<typeof insumoSchema>;

const UpsertInsumosModal = ({
  product,
  isOpen,
  onClose,
  onUpdated,
}: UpsertInsumoModalProps) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InsumoFormData>({
    resolver: zodResolver(insumoSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      class: product?.class ?? "",
      unit: product?.unit ?? "",
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || "",
        class: product.class,
        unit: product.unit,
      });
    } else {
      reset();
    }
  }, [product, isOpen, reset]);

  const onSubmit = async (data: InsumoFormData) => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      toast.error("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    const url = product
      ? `/api/insumos/products/${product.id}`
      : "/api/insumos/products";
    const method = product ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.warning(result.error || "Erro ao salvar insumo.", {
        style: {
          backgroundColor: "#F0C531",
          color: "white",
        },
        icon: "❌",
      });
    } else {
      toast.success(
        product
          ? "Insumo atualizado com sucesso!"
          : "Insumo cadastrado com sucesso!",
        {
          style: {
            backgroundColor: "#63B926",
            color: "white",
          },
          icon: "✅",
        },
      );
      onClose();
      reset();
      if (onUpdated) onUpdated();
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
          <DialogTitle>Insumos</DialogTitle>
          <DialogDescription>
            {product ? "Editar insumo" : "Cadastrar insumo"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
              <div>
                <Label>Nome</Label>
                <Input {...register("name")} placeholder="Ex: Ópera Ultra" />
                {errors.name && (
                  <span className="text-xs text-red-500">
                    {errors.name.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  {...register("description")}
                  placeholder="Ex: Fungicida de ação sistêmica"
                />
              </div>
              <div>
                <Label>Classe</Label>
                <select
                  {...register("class")}
                  className="w-full rounded border px-2 py-1"
                >
                  <option value="">Selecione</option>
                  {PRODUCT_CLASS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Unidade Comercial</Label>
                <select
                  {...register("unit")}
                  className="w-full rounded border px-2 py-1"
                >
                  <option value="">Selecione</option>
                  {PRODUCT_UNIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-green text-white"
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertInsumosModal;
