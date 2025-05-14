"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa";
import { getToken } from "@/lib/auth-client";

export function NewCompanyForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const token = getToken();
    const formData = new FormData();
    formData.append("name", name);

    const res = await fetch("/api/companies/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Erro ao criar companhia", {
            style: {
                backgroundColor: "#FF6467",
                color: "white",
              },
            icon: "❌",
        });
      setLoading(false);
      return;
    }

    toast.success("Companhia criado com sucesso!", {
        style: {
            backgroundColor: "#63B926",
            color: "white",
        },
        icon: "✅",
    });
    setLoading(false);
  }

  return (
    <div className={cn("flex flex-col items-center", className)} {...props}>
      <Card className="overflow-hidden max-w-lg">
        <CardContent className="">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Crie uma nova companhia!</h1>
                <p className="text-muted-foreground">
                  Crie uma nova companhia para gerenciar suas colheitas.
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
