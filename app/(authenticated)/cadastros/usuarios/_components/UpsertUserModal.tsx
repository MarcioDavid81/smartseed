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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";
import { AppUser } from "@/types";
import UploadAvatar from "@/app/(public)/_components/UploadAvatar";

interface UpsertUserModalProps {
  user?: AppUser;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  avatarUrl: z.string().url("URL inválida"),
});

type UserFormData = z.infer<typeof userSchema>;

const UpsertUserModal = ({
  user,
  isOpen,
  onClose,
  onUpdated,
}: UpsertUserModalProps) => {
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      avatarUrl: user?.imageUrl ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        avatarUrl: user.imageUrl || "",
      });
    } else {
      reset();
    }
  }, [user, isOpen, reset]);

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      toast.error("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    const url = user
      ? `/api/auth/register/${user.id}`
      : "/api/auth/register";
    const method = user ? "PUT" : "POST";

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
        user
          ? "Usuário atualizado com sucesso!"
          : "Usuário cadastrado com sucesso!",
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
          <DialogTitle>Usuários</DialogTitle>
          <DialogDescription>
            {user ? "Editar usuário" : "Cadastrar usuário"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
              <div>
                <Label>Nome</Label>
                <Input {...register("name")} placeholder="Ex: João da Silva" />
                {errors.name && (
                  <span className="text-xs text-red-500">
                    {errors.name.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Email</Label>
                <Input {...register("email")} placeholder="Ex: joao.silva@example.com" />
                {errors.email && (
                  <span className="text-xs text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </div>
              <div>
                <Label>Senha</Label>
                <Input {...register("password")} placeholder="Ex: 123456" />
                {errors.password && (
                  <span className="text-xs text-red-500">
                    {errors.password.message}
                  </span>
                )}
              </div>
              <div className="grid items-center justify-center gap-2">
                <Label>Avatar</Label>
                <UploadAvatar onFileSelect={setAvatarFile} />
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

export default UpsertUserModal;
