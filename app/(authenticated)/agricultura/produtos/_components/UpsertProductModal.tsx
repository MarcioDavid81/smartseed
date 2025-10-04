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
import { getToken } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";
import { IndustryProduct } from "@/types";

interface UpsertIndustryProductModalProps {
  industryProduct?: IndustryProduct;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const industryProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

type IndustryProductFormData = z.infer<typeof industryProductSchema>;

const UpsertIndustryProductModal = ({
  industryProduct,
  isOpen,
  onClose,
  onUpdated,
}: UpsertIndustryProductModalProps) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IndustryProductFormData>({
    resolver: zodResolver(industryProductSchema),
    defaultValues: {
      name: industryProduct?.name ?? "",
    },
  });

  useEffect(() => {
    if (industryProduct) {
      reset({
        name: industryProduct.name,
      });
    } else {
      reset();
    }
  }, [industryProduct, isOpen, reset]);

  const onSubmit = async (data: IndustryProductFormData) => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      toast.error("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    const url = industryProduct
      ? `/api/industry/product/${industryProduct.id}`
      : "/api/industry/product";
    const method = industryProduct ? "PUT" : "POST";

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
        industryProduct
          ? "Produto atualizado com sucesso!"
          : "Produto cadastrado com sucesso!",
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
          <DialogTitle>Produtos</DialogTitle>
          <DialogDescription>
            {industryProduct ? "Editar produto" : "Cadastrar produto"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
              <div>
                <Label>Nome</Label>
                <Input {...register("name")} placeholder="Ex: Soja" />
                {errors.name && (
                  <span className="text-xs text-red-500">
                    {errors.name.message}
                  </span>
                )}
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

export default UpsertIndustryProductModal;
