"use client";
import { useEffect, useState } from "react";
import { LogOutIcon } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import HoverButton from "@/components/HoverButton";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Garante que os cookies sejam incluídos
      });

      if (response.ok) {
        toast.success("Logout bem-sucedido");
        // Força uma atualização completa do estado da aplicação
        window.location.href = "/"; // Ou router.refresh() + router.push("/login")
      } else {
        throw new Error("Falha ao fazer logout");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao fazer logout");
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