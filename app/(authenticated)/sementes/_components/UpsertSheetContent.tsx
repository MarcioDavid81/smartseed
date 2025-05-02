"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa";

// Schema de validação
const cultivarSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  product: z.enum([
    "SOJA",
    "TRIGO",
    "MILHO",
    "AVEIA_BRANCA",
    "AVEIA_PRETA",
    "AVEIA_UCRANIANA",
    "AZEVEM",
  ]),
});

type CultivarFormData = z.infer<typeof cultivarSchema>;

const UpsertCultivarSheetContent = ({ closeSheet }: { closeSheet: () => void }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<CultivarFormData>({
    resolver: zodResolver(cultivarSchema),
    defaultValues: {
      name: "",
      product: undefined,
    },
  });

  const onSubmit = async (data: CultivarFormData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // ou pegue da store/context
      console.log(token);

      const res = await fetch("/api/cultivars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao cadastrar cultivar");
      }

      toast.success("Cultivar cadastrada com sucesso!");
      form.reset();
      closeSheet();
      // Aqui você pode acionar um refresh de lista ou fechar o Sheet, se quiser
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar cultivar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SheetContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SheetHeader>
            <SheetTitle>Adicionar uma nova cultivar?</SheetTitle>
          </SheetHeader>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cultivar</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da cultivar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produto</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SOJA">Soja</SelectItem>
                    <SelectItem value="TRIGO">Trigo</SelectItem>
                    <SelectItem value="MILHO">Milho</SelectItem>
                    <SelectItem value="AVEIA_BRANCA">Aveia Branca</SelectItem>
                    <SelectItem value="AVEIA_PRETA">Aveia Preta</SelectItem>
                    <SelectItem value="AVEIA_UCRANIANA">
                      Aveia Ucraniana
                    </SelectItem>
                    <SelectItem value="AZEVEM">Azevém</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className={`p-2 rounded-md transition-colors w-full ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Cadastrar"}
          </Button>
        </form>
      </Form>
    </SheetContent>
  );
};

export default UpsertCultivarSheetContent;
