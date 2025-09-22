"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ProductType } from "@prisma/client";
import { PRODUCT_TYPE_OPTIONS } from "../../../_constants/products";
import { getToken } from "@/lib/auth-client";
import { FaSpinner } from "react-icons/fa";

interface Cultivar {
  id: string;
  name: string;
  product: ProductType;
}

interface EditCultivarModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultivar: Cultivar | null;
  onUpdated: () => void;
}

export function EditCultivarModal({
  isOpen,
  onClose,
  cultivar,
  onUpdated,
}: EditCultivarModalProps) {
  const [name, setName] = useState("");
  const [product, setProduct] = useState<ProductType>(ProductType.SOJA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cultivar) {
      setName(cultivar.name);
      setProduct(cultivar.product);
    }
  }, [cultivar]);

  async function handleUpdate() {
    if (!cultivar) return;
    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch(`/api/cultivars/${cultivar.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, product }),
      });

      if (!res.ok) throw new Error();

      toast.success("Cultivar atualizada com sucesso!");
      onUpdated();
      onClose();
    } catch {
      toast.error("Erro ao atualizar cultivar.");
    } finally {
      setLoading(false);
    }
  }

  const [isHovered, setIsHovered] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Cultivar</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="product">Produto</Label>
            <select
              id="product"
              className="w-full border border-input bg-background rounded-md px-3 py-2"
              value={product}
              onChange={(e) => setProduct(e.target.value as ProductType)}
            >
              {PRODUCT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleUpdate}
          disabled={loading}
          className={`relative overflow-hidden px-4 py-2 w-full font-medium border-2 border-green rounded-lg bg-transparent text-gray-800 hover:text-gray-50 transition-all duration-300 ease-in-out`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span className="relative flex items-center gap-2 z-10">
            {loading ? <FaSpinner className="animate-spin" /> : "Editar"}
          </span>
          <div
            className={`absolute top-0 left-0 w-0 h-full bg-green transition-all duration-300 ease-in-out hover:w-full`}
            style={{
              width: isHovered ? "100%" : 0,
              transitionDuration: `300ms`,
            }}
          />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
