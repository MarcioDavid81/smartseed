import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSpinner } from "react-icons/fa";
import { AppUser } from "@/types";
import { useSmartToast } from "@/contexts/ToastContext";
import { CreateUserInput, createUserSchema, UpdateUserInput, updateUserSchema } from "@/lib/schemas/userSchema";
import { useUpsertUser } from "@/queries/registrations/use-upsert-user";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UploadAvatar } from "@/app/(public)/_components/UploadAvatar";
import { ApiError } from "@/lib/http/api-error";

interface UpsertUserModalProps {
  user?: AppUser;
  isOpen: boolean;
  onClose: () => void;
}

const UpsertUserModal = ({
  user,
  isOpen,
  onClose,
}: UpsertUserModalProps) => {
  const { showToast } = useSmartToast();
  const [avatar, setAvatar] = useState<File | null>(null)

  const isEditing = !!user;

  const form = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(
      isEditing ? updateUserSchema : createUserSchema
    ),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      avatar: null,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: "",
      });
    } else {
      form.reset();
    }
    setAvatar(null);
  }, [user, isOpen]);

  const { mutate, isPending } = useUpsertUser({
      userId: user?.id,
    })

  const onSubmit = async (data: CreateUserInput | UpdateUserInput) => {
      const payload = {
        ...data,
        password: data.password || undefined,
      };
      mutate(payload, {
        onSuccess: () => {
          showToast({
            type: "success",
            title: "Sucesso!",
            message: user
              ? "Usuário atualizado com sucesso!"
              : "Usuário cadastrado com sucesso!",
          });
          onClose();
          form.reset();
        },
        onError: (error: Error) => {
          if (error instanceof ApiError) {
            showToast({
              type: "info",
              title: "Limite atingido",
              message: error.message,
            });
            return;
          }
          showToast({
            type: "error",
            title: "Erro",
            message: error.message || "Ocorreu um erro ao salvar o usuário. Por favor, tente novamente.",
          });
        },
      });
    };

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Usuários</DialogTitle>
          <DialogDescription>
            {user ? "Editar usuário" : "Cadastrar usuário"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 py-2">
              <div>
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center justify-center space-y-4">
                      <FormControl>
                        <UploadAvatar
                          value={field.value}
                          onChange={field.onChange}
                          initialImageUrl={user?.imageUrl}
                          fallbackText={user?.name?.slice(0, 2).toUpperCase()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div>
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
              <div>
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Senha
                      {user && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (deixe em branco para manter)
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="mt-4 w-full bg-green text-white"
          >
            {isPending ? <FaSpinner className="animate-spin" /> : "Salvar"}
          </Button>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertUserModal;
