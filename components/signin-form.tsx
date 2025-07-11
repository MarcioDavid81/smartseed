"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa";
import UploadAvatar from "@/app/(public)/_components/UploadAvatar";

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchCompanies() {
      const res = await fetch("/api/companies", {
        cache: "no-store",
      });
      const data = await res.json();
      setCompanies(data);
    }
    fetchCompanies();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, insira um email válido.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("companyId", companyId);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Erro ao criar usuário", {
            style: {
                backgroundColor: "#FF6467",
                color: "white",
              },
            icon: "❌",
        });
      setLoading(false);
      return;
    }

    toast.success("Usuário criado com sucesso!", {
        style: {
            backgroundColor: "#63B926",
            color: "white",
        },
        icon: "✅",
    });
    router.push("/login");
  }

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="relative hidden bg-muted md:block">
            <img
              src="/colheita.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Crie sua conta!</h1>
                <p className="text-muted-foreground">
                  Crie sua conta para continuar.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="company">Empresa</Label>
                <Select onValueChange={(value) => setCompanyId(value)}>
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid items-center justify-center gap-2">
                <Label>Avatar</Label>
                <UploadAvatar onFileSelect={setAvatarFile} />
              </div>

              <Button
                type="submit"
                className={`p-2 bg-green rounded-md transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? <FaSpinner className="animate-spin" /> : "Cadastrar"}
              </Button>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
