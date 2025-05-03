"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, ChangeEvent } from "react";
import { AppUser } from "@/types/user";
import { toast } from "sonner";
import { updateUserWithImageAndPassword } from "@/actions/user";
import Image from "next/image";
import HoverButton from "@/components/HoverButton";
import { FaSpinner } from "react-icons/fa";
import { LogOutIcon } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  user: AppUser | null;
};

export const UpsertUserModal = ({ open, onClose, user }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPreview(user.imageUrl || null);
    }
  }, [user]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("id", user.id);
    formData.append("name", name);
    formData.append("email", email);
    if (password) formData.append("password", password);
    if (image) formData.append("image", image);

    try {
      await updateUserWithImageAndPassword(formData);
      toast.success("Perfil atualizado com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize suas informações abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {preview && (
            <Image
              src={preview}
              alt="Avatar preview"
              width={80}
              height={80}
              className="rounded-full mx-auto"
            />
          )}
          <Input type="file" accept="image/*" onChange={handleImageChange} />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Nova senha (opcional)"
          />
        </div>

        <DialogFooter className="mt-4">
          <HoverButton disabled={loading} onClick={handleSubmit}
            aria-label="Salvar alterações do usuário"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
                <span>Salvar</span>
            )}
          </HoverButton>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
