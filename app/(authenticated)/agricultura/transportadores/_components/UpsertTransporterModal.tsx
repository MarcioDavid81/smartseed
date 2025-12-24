import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getToken } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { IndustryTransporter } from "@/types";
import { industryTransporterSchema, IndustryTransporterFormData } from "@/lib/schemas/industryTransporter";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useSmartToast } from "@/contexts/ToastContext";

interface UpsertIndustryTransporterModalProps {
  industryTransporter?: IndustryTransporter;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const UpsertIndustryTransporterModal = ({
  industryTransporter,
  isOpen,
  onClose,
  onUpdated,
}: UpsertIndustryTransporterModalProps) => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useSmartToast();

  const form = useForm<IndustryTransporterFormData>({
    resolver: zodResolver(industryTransporterSchema),
    defaultValues: {
      name: industryTransporter?.name ?? "",
      fantasyName: industryTransporter?.fantasyName ?? "",
      cpf_cnpj: industryTransporter?.cpf_cnpj ?? "",
      adress: industryTransporter?.adress ?? "",
      city: industryTransporter?.city ?? "",
      state: industryTransporter?.state ?? "",
      phone: industryTransporter?.phone ?? "",
      email: industryTransporter?.email ?? "",
    },
  });

  useEffect(() => {
    if (industryTransporter) {
      form.reset({
        name: industryTransporter.name,
        fantasyName: industryTransporter.fantasyName,
        cpf_cnpj: industryTransporter.cpf_cnpj,
        adress: industryTransporter.adress,
        city: industryTransporter.city,
        state: industryTransporter.state,
        phone: industryTransporter.phone,
        email: industryTransporter.email,
      });
    } else {
      form.reset();
    }
  }, [industryTransporter, isOpen, form]);

  const onSubmit = async (data: IndustryTransporterFormData) => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      showToast({
        type: "error",
        title: "Erro",
        message: "Usuário não autenticado.",
      });
      setLoading(false);
      return;
    }
    
    const url = industryTransporter
      ? `/api/industry/transporter/${industryTransporter.id}`
      : "/api/industry/transporter";
    const method = industryTransporter ? "PUT" : "POST";

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
      showToast({
        type: "error",
        title: "Erro",
        message: result.error || "Erro ao salvar transportador.",
      });
      setLoading(false);
    } else {
      showToast({
        type: "success",
        title: "Sucesso",
        message: industryTransporter
          ? "Transportador atualizado com sucesso!"
          : "Transportador cadastrado com sucesso!",
      });
      onClose();
      form.reset();
      if (onUpdated) onUpdated();
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transportadores</DialogTitle>
          <DialogDescription>
            {industryTransporter ? "Editar transportador" : "Cadastrar transportador"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Transportes Agro" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fantasyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Agro" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="cpf_cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: 12345678900" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Rua A, 123" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: São Paulo" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: SP" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: (11) 91234-5678" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: contato@exemplo.com" />
                      </FormControl>
                    </FormItem>
                  )}
                />
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
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertIndustryTransporterModal;
