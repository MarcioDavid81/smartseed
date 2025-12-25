"use client";
import { useState } from "react";
import { LogOutIcon } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import HoverButton from "@/components/HoverButton";
import { toast } from "sonner";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Garante que os cookies sejam incluídos
      });

      if (response.ok) {
        toast.success("Você saiu do sistema. Até mais!")
        // Força uma atualização completa do estado da aplicação
        window.location.href = "/";
      } else {
        throw new Error("Falha ao fazer logout");
      }
    } catch (error: unknown) {
      toast.error("Erro ao tentar sair do sistema!")
    } finally {
      setLoading(false);
    }
  };

  return (
    <HoverButton
      title="Sair da conta"
      onClick={handleLogout}
      disabled={loading}
      aria-label="Sair da conta"
      className={`p-2 w-full rounded-md transition-colors ${
        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green hover:text-white"
      }`}
    >
      {loading ? (
        <FaSpinner className="animate-spin" />
      ) : (
        <div className="flex items-center gap-2">
          <LogOutIcon size={16} />
          <span>Sair</span>
        </div>
      )}
    </HoverButton>
  );
}