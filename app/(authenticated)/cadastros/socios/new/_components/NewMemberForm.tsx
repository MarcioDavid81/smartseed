"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberSchema, MemberFormData } from "@/lib/schemas/memberSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewMemberAdressForm } from "./NewMemberAdressForm";
import { CornerDownLeftIcon, PlusIcon } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { useUpsertMember } from "@/queries/registrations/use-member";
import { useSmartToast } from "@/contexts/ToastContext";
import Link from "next/link";
import InputMask from "react-input-mask";

interface MemberFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function NewMemberForm({ initialData, isEditing }: MemberFormProps) {
  const { showToast } = useSmartToast();
  const url = "/cadastros/socios"
  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      cpf: initialData?.cpf || "",
      adresses: initialData?.adresses || [
        {
          stateRegistration: initialData?.adresses?.[0]?.stateRegistration || "",
          zip: initialData?.adresses?.[0]?.zip || "",
          adress: initialData?.adresses?.[0]?.adress || "",
          number: initialData?.adresses?.[0]?.number || "",
          complement: initialData?.adresses?.[0]?.complement || "",
          district: initialData?.adresses?.[0]?.district || "",
          city: initialData?.adresses?.[0]?.city || "",
          state: initialData?.adresses?.[0]?.state || "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "adresses",
  });

  const memberId = isEditing ? initialData?.id : undefined;

  const { mutateAsync, isPending } = useUpsertMember({ memberId });

  async function onSubmit(data: MemberFormData) {
    try {
      await mutateAsync(data);

      showToast({
        type: "success",
        title: "Sucesso",
        message: isEditing
          ? "Sócio atualizado com sucesso"
          : "Sócio cadastrado com sucesso",
      });

      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Erro ao salvar sócio",
        message: "Erro ao salvar sócio, tente novamente mais tarde!",
      });
    }
  }

  return (
    <div className="w-full mx-auto py-2 max-h-[calc(100vh-170px)] overflow-y-auto scrollbar-hide">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-lg font-medium"><span className="border-b-2 border-green">Dado</span>s Principais</h3>
        <div className="border rounded-xl p-4 space-y-4 mt-8 mb-8">
          <div className="grid grid-cols-3 gap-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CPF */}
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <InputMask
                      mask="999.999.999-99"
                      placeholder="CPF"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          placeholder="CPF"
                          type="text"
                        />
                      )}
                    </InputMask>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Telefone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <InputMask
                        mask="(99) 9999-9999"
                        placeholder="Telefone"
                        value={field.value}
                        onChange={field.onChange}
                      >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          placeholder="Telefone"
                          type="text"
                        />
                      )}
                    </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
        </div>

        <h3 className="text-lg font-medium"><span className="border-b-2 border-green">Ende</span>reço</h3>
        {/* Endereços */}
        <div className="space-y-4">
          {fields.map((field, index) => (
            <NewMemberAdressForm
              key={field.id}
              index={index}
              control={form.control}
              remove={remove}
              canRemove={fields.length > 1}
            />
          ))}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={url}>
                <Button type="button" className=" bg-green text-white font-light">
                  <CornerDownLeftIcon size={20} />
                  Voltar
                </Button>
              </Link>
              <Button type="submit" className=" bg-green text-white font-light" disabled={isPending}>
                {isPending ? (
                  <FaSpinner size={20} className="animate-spin" />
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
            <Button
              type="button"
              className=" bg-green text-white font-light"
              onClick={(e) => {
                e.preventDefault();
                append({
                  stateRegistration: "",
                  zip: "",
                  adress: "",
                  number: "",
                  complement: "",
                  district: "",
                  state: "",
                  city: "",
                });
              }}
            >
              <PlusIcon size={20} />
              Endereço
            </Button>
          </div>
        </div>


      </form>
    </Form>
    </div>
  );
}